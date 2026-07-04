# Website Maker with Astro

Make a full website fast. This is a ready-to-use Astro 5 + TinaCMS starter with a blog, CMS, and SEO built in. It is not a toy template: it comes from a real, revenue-generating agency website ([theremarkableagency.com](https://theremarkableagency.com)), with the brand stripped out and everything that took months to get right kept in.

**The approach:** build a real production site first, then run a strip script that removes every brand-specific string, image, and page while preserving the architecture, design system, SEO plumbing, and content pipeline. What's left is a starter that has already survived contact with production. This repo is the output of that process, and the script itself ([strip-to-starter.sh](strip-to-starter.sh)) is included so you can do the same with your own site.

## What you get

- **Astro 5** with the Vercel adapter, sitemap, and SSR-ready API routes
- **TinaCMS** Git-based visual editing (`/admin`), pre-wired to the content collections
- **Content collections** for blog posts, case studies, and testimonials, with FAQ frontmatter that renders JSON-LD FAQ schema automatically
- **7 working routes out of the box:** `/`, `/blog`, `/blog/[slug]`, `/case-studies`, `/services`, `/about`, `/contact`
- **SEO done properly:** canonical URLs, Open Graph + Twitter meta, Organization/Article JSON-LD, sitemap index, robots.txt
- **Dark design system** in Tailwind: design tokens for color, type scale (Instrument Serif / Inter / JetBrains Mono), spacing, and border radii live in [tailwind.config.mjs](tailwind.config.mjs) and [src/styles/global.css](src/styles/global.css)
- **AI featured-image generator** ([scripts/gen-blog-image.mjs](scripts/gen-blog-image.mjs)): Gemini image gen with OpenAI fallback and a placeholder fallback so publishing never blocks on image APIs
- **Form + email plumbing:** contact form API route wired for Resend
- **IndexNow** ping endpoint for instant search-engine indexing ([api/indexnow.js](api/indexnow.js))

## Quickstart

```sh
git clone https://github.com/Almontas/website-maker-with-astro my-site
cd my-site
npm install
cp .env.local.example .env.local   # fill in only what you need
npm run dev
```

Site runs at `http://localhost:4321`. TinaCMS admin is at `http://localhost:4321/admin/index.html`.

## Personalization checklist

Work through these in order. Every placeholder is greppable: `My Site`, `example.com`, `Your Name`, `yourhandle`, `YOUR_GA4_ID`.

1. **Site URL** — `astro.config.mjs` (`https://example.com`)
2. **Identity** — `src/pages/index.astro` hero copy, then `src/pages/about.astro`
3. **Logos** — replace `public/logos/logo-dark.svg` and `logo-light.svg`
4. **Brand palette** — `tailwind.config.mjs` + token block at the top of `src/styles/global.css`
5. **Analytics** — `src/layouts/BaseLayout.astro`: replace `YOUR_GA4_ID`, `YOUR_LINKEDIN_PARTNER_ID`, `YOUR_RB2B_KEY`, or delete the blocks you don't use
6. **Nav + Footer** — `src/components/Nav.astro`, `src/components/Footer.astro`
7. **Content** — replace the example post, case study, and testimonial in `src/content/`
8. **Decide what to delete** — `src/pages/services/` and `src/pages/case-studies/` if you don't need them

## Environment variables

Copy `.env.local.example` to `.env.local`. Everything is optional; the site builds with none of them set.

| Variable | Used for |
|---|---|
| `RESEND_API_KEY`, `NOTIFICATION_EMAIL` | Contact form email delivery |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Only if you add database-backed features |
| `GOOGLE_API_KEY` | Blog image generation (Gemini) |
| `OPENAI_API_KEY` | Blog image generation fallback |

## Generating blog images

```sh
node scripts/gen-blog-image.mjs --slug my-post --prompt "A minimal dark illustration of ..."
```

Writes `public/images/blog-my-post.png`. Tries Gemini twice, falls back to OpenAI `gpt-image-1`, and finally to a local placeholder so your publish pipeline never fails on an image API outage. See [docs/CODEX_IMAGEGEN.md](docs/CODEX_IMAGEGEN.md) for the full image workflow.

## The strip-to-starter workflow

If you build your own site on top of this starter and later want to extract a fresh template from it (for a client, a second brand, or to share), the included [strip-to-starter.sh](strip-to-starter.sh) shows the pattern:

```sh
cp -r my-finished-site my-new-starter
cd my-new-starter
bash strip-to-starter.sh
```

The script works in nine phases: remove branded content collections, clear brand images, remove site-specific tools and pages, stub the homepage, reset public files (robots, manifest), sed-replace every hardcoded brand value, reset `vercel.json`, clean project docs, and re-init git. Adapt the sed lists in phases 5–7 to your own brand strings.

## Deploying

Configured for Vercel (`vercel.json` + `@astrojs/vercel` adapter). `vercel deploy --prod` or connect the repo in the Vercel dashboard. Node 24.x is pinned in `package.json`.

## License

MIT
