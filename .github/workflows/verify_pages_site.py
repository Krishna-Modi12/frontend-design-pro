#!/usr/bin/env python3
"""Check that a composed Pages upload would actually serve.

Usage: verify_pages_site.py <site-dir> <base-path>

Gate 9 builds a server bundle; the Pages workflow ships static exports of three
apps at three different prefixes — `home` at the bare project path, the other
two one level below it. Nothing upstream of the deploy can see that path, so
this is what covers it.

The question being asked is "would this 404 when served", so it is asked
directly: resolve every asset each page references against the files actually
in the upload. Pattern-matching the HTML for a prefix would pass on an upload
that has the right strings and none of the files.

The failure this exists to catch is quiet. A missing or wrong base path leaves
a page that still returns 200 and renders as unstyled HTML — it reads like a
CSS bug and is a routing one. Composing three apps makes it likelier rather
than less: the landing page's assets have to carry /landing-page, the
showcase's have to carry /showcase, home's have to carry the bare project path
and nothing after it, and one shared config drives all three.

`home` used to be a hand-written index at the root, referencing its exhibits
with relative URLs that resolved under any prefix and so could not suffer the
base-path failure above at all — checked separately, by name, for exactly the
files it copied in. It is a real Next export now, with the same baked-in
`_next/` asset URLs and the same failure mode as the other two, so it is
checked the same way: by resolving every asset reference against the upload,
not by name.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

# This runs on ubuntu in CI, where the tick below is fine, and by hand on
# Windows, where the console defaults to cp1252 and cannot encode it. Every
# other script in this repo carries the same guard; without it the success path
# raises UnicodeEncodeError and a passing verification exits non-zero.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

# Asset URLs as they appear in markup: href="...", src='...', url(...).
#
# Deliberately matches any absolute path containing `_next/`, prefixed or not.
# Requiring the base path here would have made the whole check vacuous: a page
# whose assets *lost* the prefix would match nothing, report no references, and
# pass — which is exactly the failure this file exists to catch. Caught by the
# negative control that strips the prefix and expects a non-zero exit.
_ASSET = re.compile(r"""["'(](/[^"'\s)\\]*_next/[^"'\s)\\]+)""")


def fail(message: str) -> None:
    print(f"::error::{message}")


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__)
        return 2

    site = pathlib.Path(argv[1])
    base = argv[2].rstrip("/")

    if not site.is_dir():
        fail(f"no such site directory: {site}")
        return 1

    # The entry points a visitor actually lands on. Checking assets alone would
    # pass an upload that lost a page entirely.
    required = {
        "home (site root)": site / "index.html",
        "the showcase (/showcase/)": site / "showcase" / "index.html",
        "the landing page (/landing-page/)": site / "landing-page" / "index.html",
        "the overview endpoint the landing page reads on mount":
            site / "landing-page" / "api" / "site" / "overview",
    }
    missing_pages = [label for label, path in required.items() if not path.is_file()]
    for label in missing_pages:
        fail(f"missing from the upload: {label} — expected {required[label]}")
    if missing_pages:
        return 1

    # The landing page renders its error state permanently if this payload is
    # not what it expects, and that state is indistinguishable from a real
    # outage. An export that silently produced an error body would still be a
    # file on disk, so check the shape rather than the existence.
    endpoint = required["the overview endpoint the landing page reads on mount"]
    try:
        payload = json.loads(endpoint.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"the exported overview endpoint is not readable JSON: {exc}")
        return 1
    if not isinstance(payload.get("metrics"), list) or not payload["metrics"]:
        fail("the exported overview endpoint carries no metrics — the landing "
             "page would render its error state on every visit")
        return 1

    pages = sorted(site.rglob("*.html"))
    if not pages:
        fail(f"no HTML anywhere under {site}")
        return 1

    unprefixed: list[tuple[str, str]] = []
    dangling: list[tuple[str, str]] = []
    checked = 0

    for page in pages:
        rel_page = page.relative_to(site).as_posix()
        for ref in sorted(set(_ASSET.findall(page.read_text(encoding="utf-8")))):
            checked += 1
            if not ref.startswith(base + "/"):
                unprefixed.append((rel_page, ref))
                continue
            if not (site / ref[len(base) + 1:]).is_file():
                dangling.append((rel_page, ref))

    for rel_page, ref in unprefixed:
        fail(f"{rel_page}: asset URL is missing {base}: {ref}")
    for rel_page, ref in dangling:
        fail(f"{rel_page}: asset URL resolves to no file in the upload: {ref}")
    if unprefixed or dangling:
        return 1

    print(f"✓ {len(pages)} page(s), {checked} asset reference(s): all carry {base} "
          f"and all resolve to files in the upload")
    print(f"✓ overview endpoint exports {len(payload['metrics'])} metrics")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
