#!/usr/bin/env python3
"""
Placeholder image candidate generator.

    python scripts/fetch_unsplash_images.py --keywords "office,workspace" \
        --use-case placeholder --ack-remote-placeholders
    python scripts/fetch_unsplash_images.py --keywords "nature,forest" \
        --use-case internal-mock --ack-remote-placeholders --format json

Maps a keyword to one of nine curated categories and returns Unsplash CDN URLs.
Standard library only; it makes no network call itself, it composes URLs from a
hardcoded list of photo ids.

Provenance: vendored from `xiaopu-ai/web-design` (MIT, Copyright (c) 2026
KAOPU-XiaoPu). The logic is unchanged. The only edit is that its argparse help
strings were Chinese and are now English, since a CLI whose --help nobody on this
side can read is not a usable tool.

READ THIS BEFORE USING IT. This pack's anti-slop wall exists partly because
hotlinked stock photography is one of the reliable tells of generated work, and
the guidance elsewhere in this repo is to ship a real image or none. The script
agrees with that more than its name suggests — it refuses to run without both
`--use-case` (placeholder, wireframe, or internal-mock) and the explicit
`--ack-remote-placeholders` flag, which is a better-designed guardrail than most
tools of this kind carry.

So the honest position: this is for wireframes and internal mocks, where a real
photograph is not yet available and a grey box would misrepresent the layout. It
is not an asset pipeline.

Four things that are true and are easy to forget:

  1. **The ids rot.** They are hardcoded. Photos get taken down, and a dead
     Unsplash id returns a 404 image, not a fallback. Check what you get.
  2. **Hotlinking is a third-party origin.** Every one of these URLs is a request
     to `images.unsplash.com` at page load — a content security policy entry, a
     privacy consideration, and a dependency on someone else's uptime.
  3. **The Unsplash Licence is permissive but not public domain.** It allows
     commercial use without permission and asks for attribution where practical.
     It does not clear model or property releases, so a recognisable face or a
     trademarked building in one of these frames is your problem, not Unsplash's.
     Do not put these in front of a paying customer as production assets.
  4. **Download rather than hotlink** the moment a mock becomes something real.

`skills/iconography/references/icons-avatars.md` covers the alternative for the
commonest case, which is people: initials avatars beat a stock portrait of
somebody who does not work at the company.
"""

import argparse
import json
import sys

CURATED_IMAGES = {
    "hero": [
        "photo-1451187580459-43490279c0fa",
        "photo-1519681393784-d120267933ba",
        "photo-1506905925346-21bda4d32df4",
        "photo-1470071459604-3b5ec3a7fe05",
        "photo-1497032628192-86f99bcd76bc",
    ],
    "portrait": [
        "photo-1507003211169-0a1dd7228f2d",
        "photo-1494790108377-be9c29b29330",
        "photo-1539571696357-5a69c17a67c6",
        "photo-1534528741775-53994a69daeb",
        "photo-1506794778202-cad84cf45f1d",
    ],
    "workspace": [
        "photo-1497366216548-37526070297c",
        "photo-1497032628192-86f99bcd76bc",
        "photo-1498050108023-c5249f4df085",
        "photo-1531297484001-80022131f5a1",
        "photo-1517180102446-f3ece451e9d8",
    ],
    "technology": [
        "photo-1518770660439-4636190af475",
        "photo-1550751827-4bd374c3f58b",
        "photo-1504639725590-34d0984388bd",
        "photo-1526374965328-7f61d4dc18c5",
        "photo-1555949963-ff9fe0c870eb",
    ],
    "nature": [
        "photo-1470071459604-3b5ec3a7fe05",
        "photo-1441974231531-c6227db76b6e",
        "photo-1506905925346-21bda4d32df4",
        "photo-1507525428034-b723cf961d3e",
        "photo-1518837695005-2083093ee35b",
    ],
    "abstract": [
        "photo-1557672172-298e090bd0f1",
        "photo-1558591710-4b4a1ae0f04d",
        "photo-1579546929518-9e396f3cc809",
        "photo-1550684376-efcbd6e3f031",
        "photo-1618005182384-a83a8bd57fbe",
    ],
    "product": [
        "photo-1523275335684-37898b6baf30",
        "photo-1505740420928-5e560c06d30e",
        "photo-1526170375885-4d8ecf77b99f",
        "photo-1491553895911-0055eca6402d",
        "photo-1542291026-7eec264c27ff",
    ],
    "food": [
        "photo-1504674900247-0877df9cc836",
        "photo-1512621776951-a57141f2eefd",
        "photo-1540189549336-e6e99c3679fe",
        "photo-1565299624946-b28f40a0ae38",
        "photo-1498837167922-ddd27525d352",
    ],
    "business": [
        "photo-1454165804606-c3d57bc86b40",
        "photo-1552664730-d307ca884978",
        "photo-1542744173-8e7e53415bb0",
        "photo-1556761175-5973dc0f32e7",
        "photo-1553877522-43269d4ea984",
    ],
}


def generate_unsplash_url(photo_id, width=800, height=600):
    return f"https://images.unsplash.com/{photo_id}?w={width}&h={height}&fit=crop&auto=format&q=80"


def get_images_by_category(category, count=3, width=800, height=600, strict=True):
    category = category.lower()
    matched_category = None
    for cat_name in CURATED_IMAGES:
        if cat_name in category or category in cat_name:
            matched_category = cat_name
            break

    keyword_map = {
        "人物": "portrait", "头像": "portrait", "team": "portrait", "avatar": "portrait",
        "办公": "workspace", "工作": "workspace", "desk": "workspace", "office": "workspace",
        "代码": "technology", "编程": "technology", "ai": "technology", "tech": "technology",
        "风景": "nature", "山": "nature", "海": "nature", "forest": "nature",
        "抽象": "abstract", "背景": "abstract", "gradient": "abstract", "texture": "abstract",
        "产品": "product", "展示": "product", "mockup": "product",
        "美食": "food", "餐": "food", "coffee": "food",
        "商务": "business", "会议": "business", "meeting": "business",
        "首屏": "hero", "banner": "hero", "cover": "hero",
    }

    if not matched_category:
        for keyword, cat in keyword_map.items():
            if keyword in category:
                matched_category = cat
                break

    if not matched_category:
        if strict:
            return None, []
        matched_category = "abstract"

    photos = CURATED_IMAGES[matched_category]
    selected = photos[:min(count, len(photos))]
    return matched_category, [generate_unsplash_url(pid, width, height) for pid in selected]


def main():
    parser = argparse.ArgumentParser(description="Generate remote placeholder image candidates")
    parser.add_argument("--keywords", type=str, required=True, help="Image keywords, comma separated")
    parser.add_argument("--count", type=int, default=3, help="How many images per keyword")
    parser.add_argument("--size", type=str, default="800x600", help="Image size as WxH")
    parser.add_argument("--format", type=str, choices=["text", "json"], default="text", help="Output format")
    parser.add_argument(
        "--use-case",
        type=str,
        required=True,
        choices=["placeholder", "wireframe", "internal-mock"],
        help="Declared use. Placeholder, wireframe or internal mock only.",
    )
    parser.add_argument(
        "--ack-remote-placeholders",
        action="store_true",
        help="Confirm this task may use remote placeholder candidates rather than user-supplied or local assets.",
    )
    parser.add_argument(
        "--loose",
        action="store_true",
        help="Fall back to the abstract category when no keyword matches. Off by default, so an unmatched keyword returns nothing rather than something irrelevant.",
    )
    args = parser.parse_args()

    if not args.ack_remote_placeholders:
        print(
            "Error: remote placeholder candidates are disabled by default. "
            "Pass --ack-remote-placeholders only when user/local assets are unavailable and placeholders are acceptable.",
            file=sys.stderr,
        )
        sys.exit(2)

    try:
        width, height = map(int, args.size.lower().split("x"))
    except ValueError:
        print("Error: --size must use WIDTHxHEIGHT format, for example 800x600.", file=sys.stderr)
        sys.exit(2)

    if width <= 0 or height <= 0 or width > 4000 or height > 4000:
        print("Error: size must be between 1x1 and 4000x4000.", file=sys.stderr)
        sys.exit(2)

    if args.count <= 0 or args.count > 10:
        print("Error: --count must be between 1 and 10.", file=sys.stderr)
        sys.exit(2)

    keywords = [k.strip() for k in args.keywords.split(",")]

    results = {}
    unmatched = []
    for keyword in keywords:
        matched_category, urls = get_images_by_category(
            keyword,
            args.count,
            width,
            height,
            strict=not args.loose,
        )
        if not urls:
            unmatched.append(keyword)
            continue
        results[keyword] = {
            "matched_category": matched_category,
            "source_type": "remote-placeholder-candidate",
            "provider": "unsplash-cdn",
            "use_case": args.use_case,
            "requires_review": True,
            "should_download_before_shipping": True,
            "urls": urls,
        }

    payload = {
        "notice": (
            "Remote stock image candidates for placeholder/mock use only. "
            "Prefer user assets or local project assets for production deliverables."
        ),
        "results": results,
        "unmatched_keywords": unmatched,
    }

    if args.format == "json":
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print("NOTICE: remote placeholder candidates only; do not assume production-safe licensing.")
        if unmatched:
            print(f"UNMATCHED: {', '.join(unmatched)}")
        for keyword, item in results.items():
            print(f"\n=== {keyword} ({item['matched_category']}) ===")
            print("  source_type: remote-placeholder-candidate")
            print("  review_required: yes")
            print("  download_before_shipping: yes")
            for i, url in enumerate(item["urls"], 1):
                print(f"  [{i}] {url}")


if __name__ == "__main__":
    main()
