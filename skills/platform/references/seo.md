# SEO Reference for React / Next.js Apps
# frontend-design-pro-v10 | v1.0.0
# ─────────────────────────────────────────────────────────────────────────────
# Source: affaan-m/everything-claude-code (skills/seo) + Next.js docs
# Covers: technical SEO, Core Web Vitals, metadata API, structured data,
# canonical/sitemap/robots, OG tags, on-page rules, keyword mapping.
# ─────────────────────────────────────────────────────────────────────────────

## Core Principles

1. Fix technical blockers before content optimization
2. One page = one clear primary search intent
3. Long-term quality signals over manipulative patterns
4. Mobile-first — Google indexes mobile version
5. Every recommendation should be page-specific, not generic

---

## 1. Next.js Metadata API (App Router)

### Static metadata

```tsx
// app/page.tsx or any layout/page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Title — 50–60 characters, keyword near front
  title: {
    default: 'Primary Topic — Brand',
    template: '%s | Brand',   // child pages: "Product Name | Brand"
  },
  // Meta description — 120–160 characters
  description: 'Action + topic + value proposition + one supporting detail.',

  // Canonical URL (prevent duplicate content)
  alternates: {
    canonical: 'https://example.com/page',
  },

  // Open Graph
  openGraph: {
    title: 'Primary Topic — Brand',
    description: 'Clear value statement for social sharing.',
    url: 'https://example.com/page',
    siteName: 'Brand Name',
    images: [
      {
        url: 'https://example.com/og.jpg',  // 1200×630px recommended
        width: 1200,
        height: 630,
        alt: 'Descriptive alt text for the OG image',
      },
    ],
    locale: 'en_US',
    type: 'website',          // 'article' for blog posts
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Primary Topic',
    description: 'Short description for Twitter card.',
    images: ['https://example.com/og.jpg'],
    creator: '@handle',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### Dynamic metadata (product/blog pages)

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}

  const ogImage = post.image ?? '/default-og.jpg'

  return {
    title: post.title,              // template from layout adds " | Brand"
    description: post.excerpt,
    alternates: { canonical: `https://example.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, images: [ogImage] },
  }
}
```

---

## 2. Structured Data (JSON-LD)

Always inject via `<script type="application/ld+json">`. Never keyword-stuff.

### Escape it — `JSON.stringify` alone is an XSS sink

`JSON.stringify` escapes quotes and backslashes. It does **not** escape `<`. Every
schema below is built from CMS fields — `post.title`, `product.description`,
`faq.answer` — so one value containing `</script><script>…` closes this element
and runs. It is stored XSS, it renders in the root layout, and it is on every page.

```tsx
// lib/json-ld.ts
// The JSON parser reads < back as "<", so the payload is unchanged and
// inert. Escape at the point of serialisation, never at the point of authoring —
// a rule that lives in the CMS is a rule the next integration forgets.
export const jsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c");
```

Use `jsonLd(schema)` for every block on this page. `next/script` does not help
here: it serialises the same string the same way.

### Organization (homepage)

```tsx
// app/layout.tsx — inject once in root layout
import { jsonLd } from "@/lib/json-ld";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Brand Name',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/brand',
      'https://linkedin.com/company/brand',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(org) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Article / BlogPosting

```tsx
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { '@type': 'Person', name: post.author.name, url: post.author.url },
  publisher: {
    '@type': 'Organization',
    name: 'Brand Name',
    logo: { '@type': 'ImageObject', url: 'https://example.com/logo.png' },
  },
  image: { '@type': 'ImageObject', url: post.image, width: 1200, height: 630 },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `https://example.com/blog/${post.slug}` },
}
```

### Product

```tsx
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images,
  brand: { '@type': 'Brand', name: 'Brand Name' },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `https://example.com/products/${product.slug}`,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
}
```

### BreadcrumbList (inner pages)

```tsx
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://example.com/blog' },
    { '@type': 'ListItem', position: 3, name: post.title, item: `https://example.com/blog/${post.slug}` },
  ],
}
```

### FAQPage (only when content truly matches)

```tsx
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}
```

---

## 3. Sitemap + Robots

### Sitemap (Next.js App Router)

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  const products = await getProducts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: 'https://example.com',         lastModified: new Date(), changeFrequency: 'monthly',  priority: 1 },
    { url: 'https://example.com/about',   lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.5 },
    { url: 'https://example.com/pricing', lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.9 },
    { url: 'https://example.com/blog',    lastModified: new Date(), changeFrequency: 'weekly',   priority: 0.8 },
  ]

  const dynamicPosts: MetadataRoute.Sitemap = posts.map(post => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...dynamicPosts]
}
```

### Robots.txt (Next.js App Router)

```tsx
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
    host: 'https://example.com',
  }
}
```

---

## 4. Core Web Vitals

| Metric | Good | Needs improvement | Poor | What it measures |
|---|---|---|---|---|
| **LCP** | < 2.5s | 2.5–4.0s | > 4.0s | Largest visible element load time |
| **INP** | < 200ms | 200–500ms | > 500ms | Interaction responsiveness (replaced FID) |
| **CLS** | < 0.1 | 0.1–0.25 | > 0.25 | Visual layout shift |

### LCP fixes

```tsx
// 1. Priority flag on above-fold images — CRITICAL
<Image src="/hero.jpg" alt="..." priority />

// 2. Preconnect to font/image origins
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

// 3. Preload critical hero image (in head)
<link rel="preload" as="image" href="/hero.jpg" />

// 4. next/image automatically: lazy-loads, serves WebP, sizes correctly
// Always use it — never raw <img> for content images

// 5. Avoid CSS background-image for hero — use <Image priority> instead
// CSS backgrounds are not LCP-optimizable by the browser
```

### INP fixes

```tsx
// 1. Move heavy computation off main thread
const worker = new Worker(new URL('./heavy.worker.ts', import.meta.url))

// 2. Debounce expensive event handlers
const debouncedSearch = useDebounce(query, 200)

// 3. Split expensive renders with startTransition
startTransition(() => setFilteredItems(heavyFilter(items)))

// 4. Avoid layout thrashing — batch DOM reads before writes
// BAD: alternating reads and writes
// GOOD: read all → write all
```

### CLS fixes

```tsx
// 1. Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>  {/* known height slot */}
  <DynamicContent />
</div>

// 2. Always specify width + height on images
<Image src="..." width={800} height={600} alt="..." />

// 3. Font loading — use next/font, always display=swap
// CLS from FOUT is eliminated when using next/font

// 4. Ads / embeds — reserve slot BEFORE they load
<div className="ad-slot min-h-[250px]">
  <AdComponent />
</div>
```

---

## 5. Technical SEO Checklist

### Crawlability
- [ ] `robots.txt` allows important pages, blocks `/api/`, `/admin/`, `/_next/`
- [ ] No important page accidentally set to `noindex`
- [ ] Important pages reachable in ≤ 3 clicks from homepage
- [ ] No redirect chains > 2 hops
- [ ] Canonical tags are self-consistent and non-looping

### Indexability
- [ ] URL format consistent (trailing slash or not — pick one and stick to it)
- [ ] Multilingual pages have correct `hreflang` (if applicable)
- [ ] Sitemap reflects intended public surface (no 404s, no noindex pages)
- [ ] No duplicate URLs competing without canonical control (e.g. `?ref=`, `?utm_source=`)

### On-page structure
- [ ] One `<h1>` per page
- [ ] `<h2>` / `<h3>` reflect actual content hierarchy (not visual styling)
- [ ] Title: 50–60 characters, primary keyword near front
- [ ] Meta description: 120–160 characters, honest, includes main topic
- [ ] Canonical set on every page
- [ ] OG tags present on every public page

### Performance (Core Web Vitals)
- [ ] LCP < 2.5s — hero image uses `<Image priority>`
- [ ] INP < 200ms — no heavy synchronous work in event handlers
- [ ] CLS < 0.1 — image dimensions explicit, font uses next/font

---

## 6. On-Page Rules

### Title tag formula
```
Primary Keyword / Topic — Specific Modifier | Brand Name
```
Examples:
- `Async State Management in React 19 — A Complete Guide | TechBlog`
- `Handmade Ceramic Mugs — Earthy & Organic | Studio Clay`

### Meta description formula
```
[Action verb] + [topic] + [value proposition] + [one supporting detail]
```
Example: `Learn how to implement Zustand with TypeScript in under 10 minutes — includes devtools setup, immer middleware, and selector patterns.`

### Heading structure
```
H1: The one thing this page is about (one per page)
  H2: Major section (3–6 per page)
    H3: Sub-section
      H4: Rarely needed — use only for truly nested content
```
Never skip heading levels for visual styling — use CSS instead.

---

## 7. Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| Keyword stuffing in title/body | Write for users first; keyword fits naturally |
| Thin near-duplicate pages | Consolidate or add genuinely different content |
| Schema for content not on the page | Match schema exactly to real content |
| Generic `noindex` on whole sections | Audit page by page; index what has value |
| Same title tag on multiple pages | Every page needs a unique title |
| Dynamic pages with no `generateMetadata` | Always implement dynamic metadata |
| `<img>` instead of `<Image>` for content | Next.js Image handles LCP, lazy load, format |
| OG image > 5MB | Compress — Twitter rejects large OG images |
| Canonical pointing to wrong domain | Self-canonical must match exact URL format |

---

## 8. Internal Linking

- Link from high-authority pages (homepage, popular posts) to pages you want to rank
- Use descriptive anchor text — not "click here" or "learn more"
- Add links from new pages to related existing ones on publish
- Detect and fix orphan pages (no internal links pointing to them)

```tsx
// Pattern for rich internal linking in blog posts
// Use a Related Posts component on every article
function RelatedPosts({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const related = useRelatedPosts(currentSlug, tags, 3)
  return (
    <nav aria-label="Related articles">
      <h2 className="text-lg font-semibold mb-4">Related reading</h2>
      {related.map(post => (
        <a key={post.slug} href={`/blog/${post.slug}`} className="block ...">
          {post.title}
        </a>
      ))}
    </nav>
  )
}
```

---

## 9. Quick Audit Output Format

```
[HIGH]   Duplicate title tags on product pages
         Location: app/products/[slug]/page.tsx
         Issue: generateMetadata returns static default instead of product name.
         Fix: return { title: product.name } from generateMetadata.

[MEDIUM] Missing OG image on pricing page
         Location: app/pricing/page.tsx
         Issue: No openGraph.images defined in metadata export.
         Fix: Add 1200×630 OG image optimized for social sharing.

[LOW]    CLS from unsized avatar images in team section
         Location: components/team-grid.tsx line 34
         Issue: <img> without explicit width/height causes layout shift.
         Fix: Replace with <Image width={64} height={64} ... />.
```
