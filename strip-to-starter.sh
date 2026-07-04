#!/bin/bash
# ============================================================
# strip-to-starter.sh
# Strips the Remarkable Agency codebase down to a reusable
# Astro starter template. Run this INSIDE the copied folder.
#
# Usage:
#   cp -r Remarkable-Agency-Web-main my-new-site
#   cd my-new-site
#   bash strip-to-starter.sh
# ============================================================

set -euo pipefail

echo ""
echo "=== Astro Starter Template Generator ==="
echo ""

# -----------------------------------------------------------
# 0. Safety check
# -----------------------------------------------------------
if [ ! -f "astro.config.mjs" ]; then
  echo "ERROR: No astro.config.mjs found. Run this inside the copied project folder."
  exit 1
fi

if [ -d ".git" ] && git remote get-url origin 2>/dev/null | grep -q "Remarkable"; then
  echo "ERROR: You're still inside the original repo. Copy the folder first:"
  echo "  cp -r Remarkable-Agency-Web-main my-new-site && cd my-new-site"
  exit 1
fi

# Helper: cross-platform sed in-place. Used by multiple phases below.
sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# -----------------------------------------------------------
# 1. Remove brand-specific content
# -----------------------------------------------------------
echo "[1/9] Removing brand-specific content..."

rm -rf src/content/blog/*.md
rm -rf src/content/case-studies/*.md
rm -rf src/content/testimonials/*.md

# Create placeholder content so collections aren't empty
mkdir -p src/content/blog src/content/case-studies src/content/testimonials

cat > src/content/blog/example-post.md << 'BLOGEOF'
---
title: "Your First Blog Post"
author: "Your Name"
categories: ["Growth Strategy"]
excerpt: "A starter blog post to test your setup."
postType: "Guide"
cardHook: "A short hook shown on the blog index card."
publishDate: 2026-01-01
featuredImage: "/images/placeholder.jpg"
faqs:
  - question: "What is this site about?"
    answer: "Replace this with your own FAQ."
---

Replace this content with your first real blog post.
BLOGEOF

cat > src/content/case-studies/example-project.md << 'CSEOF'
---
title: "Example Project"
client: "Client Name"
industry: "SaaS"
service: "Growth Strategy"
challenge: "Describe the challenge here."
heroMetric: "100%"
heroMetricLabel: "Key Metric"
publishDate: 2026-01-01
featuredImage: "/images/placeholder.jpg"
---

Replace this with a real case study.
CSEOF

cat > src/content/testimonials/example-testimonial.md << 'TESTEOF'
---
quote: "Replace this with a real testimonial."
name: "Person Name"
title: "Their Title"
company: "Company Name"
featured: true
---
TESTEOF

# -----------------------------------------------------------
# 2. Remove brand-specific images and logos
# -----------------------------------------------------------
echo "[2/9] Clearing brand images and logos (preserving newsletter assets)..."

# Preserve any newsletter-prefixed images (Beehiiv workflow lives in this repo)
mkdir -p public/images public/logos
find public/images -type f ! -name 'newsletter-*' -delete 2>/dev/null || true
rm -rf public/logos/*

cat > public/images/placeholder.jpg << 'IMGEOF'
IMGEOF
echo "<!-- Replace with your logo -->" > public/logos/logo-dark.svg
echo "<!-- Replace with your logo -->" > public/logos/logo-light.svg

# -----------------------------------------------------------
# 3. Remove brand-specific tools (diagnostic, audit)
# -----------------------------------------------------------
echo "[3/9] Removing diagnostic & audit tools..."

rm -rf src/pages/audit
rm -rf src/pages/audit-api
rm -rf src/pages/diagnostic
rm -rf src/pages/diagnostic-api
rm -rf lib/

# -----------------------------------------------------------
# 4. Remove brand-specific pages
# -----------------------------------------------------------
echo "[4/9] Removing brand-specific pages..."

rm -f src/pages/90-day-jumpstart.astro
rm -f src/pages/careers.astro
rm -rf src/pages/lp

# -----------------------------------------------------------
# 5. Remove home sections (heavily branded copy)
# -----------------------------------------------------------
echo "[5/9] Removing branded home section components..."

rm -rf src/components/home/

# Create a minimal home sections directory with a placeholder hero
mkdir -p src/components/home

cat > src/components/home/HeroSection.astro << 'HEROEOF'
---
// Replace with your own hero section
---
<section class="relative min-h-[80vh] flex items-center justify-center px-6">
  <div class="max-w-4xl text-center">
    <h1 class="font-headline text-5xl md:text-6xl tracking-tightest text-cream mb-6">
      Your Headline Here
    </h1>
    <p class="font-body text-lg text-muted-stone max-w-2xl mx-auto mb-10">
      Your subheadline goes here. Describe what you do and who you help.
    </p>
    <a href="/contact" class="inline-block px-8 py-4 bg-gold text-espresso font-body font-semibold rounded-brand-md hover:bg-amber transition-colors duration-200">
      Get in Touch
    </a>
  </div>
</section>
HEROEOF

# Replace src/pages/index.astro with a minimal stub that only uses HeroSection.
# The original imports 8 home/* components — all but HeroSection are deleted above.
cat > src/pages/index.astro << 'INDEXEOF'
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/home/HeroSection.astro';
---

<BaseLayout description="Replace this with your site description.">
  <HeroSection />
</BaseLayout>
INDEXEOF

# Strip LogoBar imports and usages from pages that survive the strip.
# (about.astro, services/index.astro, case-studies/index.astro all import it.)
for f in src/pages/about.astro src/pages/services/index.astro src/pages/case-studies/index.astro; do
  if [ -f "$f" ]; then
    sedi "/^import LogoBar from .*home\/LogoBar.astro';$/d" "$f"
    sedi '/<LogoBar \/>/d' "$f"
  fi
done

# -----------------------------------------------------------
# 6. Remove LLM context files and brand-specific public files
# -----------------------------------------------------------
echo "[6/9] Cleaning public files..."

rm -f public/llms.txt
rm -f public/llms-full.txt

# Reset site.webmanifest
cat > public/site.webmanifest << 'MANIFESTEOF'
{
  "name": "My Site",
  "short_name": "MySite",
  "icons": [
    { "src": "/favicon.png", "sizes": "192x192", "type": "image/png" }
  ],
  "theme_color": "#1E1B18",
  "background_color": "#1E1B18",
  "display": "standalone"
}
MANIFESTEOF

# Reset robots.txt
cat > public/robots.txt << 'ROBOTSEOF'
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
ROBOTSEOF

# -----------------------------------------------------------
# 7. Strip hardcoded brand values from source files
# -----------------------------------------------------------
echo "[7/9] Replacing hardcoded brand values..."

# (sedi() defined at top of script.)

# -- astro.config.mjs: site URL
sedi "s|https://theremarkableagency.com|https://example.com|g" astro.config.mjs

# -- package.json: project name
sedi 's|"the-remarkable-website"|"my-new-site"|g' package.json

# -- BaseLayout.astro: analytics, tracking, company info
if [ -f "src/layouts/BaseLayout.astro" ]; then
  # Google Analytics - comment out the entire block
  sedi 's|G-YZXG1E1RN1|YOUR_GA4_ID|g' src/layouts/BaseLayout.astro

  # LinkedIn partner ID
  sedi 's|6948465|YOUR_LINKEDIN_PARTNER_ID|g' src/layouts/BaseLayout.astro

  # RB2B
  sedi 's|ZQO92DHRL2N7|YOUR_RB2B_KEY|g' src/layouts/BaseLayout.astro

  # Company name
  sedi 's|The Remarkable|My Site|g' src/layouts/BaseLayout.astro

  # Founder/owner name (careful - Alex Montas is also the new site owner, leave as-is or make generic)
  # sedi 's|Alex Montas|Your Name|g' src/layouts/BaseLayout.astro

  # Email
  sedi 's|hello@theremarkableagency.com|hello@example.com|g' src/layouts/BaseLayout.astro

  # Domain references
  sedi 's|theremarkableagency\.com|example.com|g' src/layouts/BaseLayout.astro

  # Social URLs
  sedi 's|https://x.com/alexmontas|https://x.com/yourhandle|g' src/layouts/BaseLayout.astro
  sedi 's|https://www.linkedin.com/in/almontas/|https://www.linkedin.com/in/yourprofile/|g' src/layouts/BaseLayout.astro
  sedi 's|https://www.linkedin.com/company/27021769|https://www.linkedin.com/company/yourcompany|g' src/layouts/BaseLayout.astro

  # Booking URL
  sedi 's|https://book.vimcal.com/p/alexmontas/30minutes-80e35|https://example.com/book|g' src/layouts/BaseLayout.astro
fi

# -- Nav.astro
if [ -f "src/components/Nav.astro" ]; then
  sedi 's|hello@theremarkableagency.com|hello@example.com|g' src/components/Nav.astro
  sedi 's|The Remarkable|My Site|g' src/components/Nav.astro
  sedi 's|theremarkableagency\.com|example.com|g' src/components/Nav.astro
fi

# -- Footer.astro
if [ -f "src/components/Footer.astro" ]; then
  sedi 's|hello@theremarkableagency.com|hello@example.com|g' src/components/Footer.astro
  sedi 's|The Remarkable|My Site|g' src/components/Footer.astro
  sedi 's|theremarkableagency\.com|example.com|g' src/components/Footer.astro
  sedi 's|https://book.vimcal.com/p/alexmontas/30minutes-80e35|https://example.com/book|g' src/components/Footer.astro
fi

# -- Other pages that reference the brand
for f in src/pages/contact.astro src/pages/about.astro src/pages/thank-you.astro src/pages/privacy-policy.astro src/pages/data-deletion.astro src/pages/index.astro src/pages/404.astro; do
  if [ -f "$f" ]; then
    sedi 's|hello@theremarkableagency.com|hello@example.com|g' "$f"
    sedi 's|The Remarkable|My Site|g' "$f"
    sedi 's|theremarkableagency\.com|example.com|g' "$f"
    sedi 's|https://book.vimcal.com/p/alexmontas/30minutes-80e35|https://example.com/book|g' "$f"
  fi
done

# -- Service pages
for f in src/pages/services/*.astro; do
  if [ -f "$f" ]; then
    sedi 's|hello@theremarkableagency.com|hello@example.com|g' "$f"
    sedi 's|The Remarkable|My Site|g' "$f"
    sedi 's|theremarkableagency\.com|example.com|g' "$f"
    sedi 's|https://book.vimcal.com/p/alexmontas/30minutes-80e35|https://example.com/book|g' "$f"
  fi
done

# -- Blog/case-study dynamic route pages
for f in src/pages/blog/*.astro src/pages/case-studies/*.astro; do
  if [ -f "$f" ]; then
    sedi 's|hello@theremarkableagency.com|hello@example.com|g' "$f"
    sedi 's|The Remarkable|My Site|g' "$f"
    sedi 's|theremarkableagency\.com|example.com|g' "$f"
  fi
done

# -----------------------------------------------------------
# 8. Clean up vercel.json (remove old redirects & cron)
# -----------------------------------------------------------
echo "[8/9] Resetting vercel.json..."

cat > vercel.json << 'VERCELEOF'
{
  "framework": "astro"
}
VERCELEOF

# -----------------------------------------------------------
# 9. Remove Remarkable-specific docs and reset project files
# -----------------------------------------------------------
echo "[9/9] Cleaning up project docs and meta files..."

rm -f prd.md
rm -f CLAUDE.md

# Preserve docs/CODEX_IMAGEGEN.md (portable image-gen guide, not brand-specific)
CODEX_GUIDE_TMP=""
if [ -f "docs/CODEX_IMAGEGEN.md" ]; then
  CODEX_GUIDE_TMP="$(mktemp)"
  cp docs/CODEX_IMAGEGEN.md "$CODEX_GUIDE_TMP"
fi
rm -rf docs/
if [ -n "$CODEX_GUIDE_TMP" ]; then
  mkdir -p docs
  mv "$CODEX_GUIDE_TMP" docs/CODEX_IMAGEGEN.md
fi

rm -rf tasks/
rm -rf tina/__generated__

# Remove .env.local if it was copied (contains Remarkable API keys)
rm -f .env.local

# Create a fresh .env.local template
cat > .env.local.example << 'ENVEOF'
# Copy this to .env.local and fill in your values

# Site
SITE_URL=https://example.com

# Email (Resend)
RESEND_API_KEY=
NOTIFICATION_EMAIL=

# Database (Supabase) - only if you need it
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Image generation
GOOGLE_API_KEY=
OPENAI_API_KEY=
ENVEOF

# Reset git
rm -rf .git
git init
git add -A
git commit -m "Initial commit: Astro starter from template"

echo ""
echo "=== Done! ==="
echo ""
echo "Your starter template is ready. Next steps:"
echo ""
echo "  1. Update tailwind.config.mjs with your brand colors"
echo "  2. Replace public/logos/ with your logos"
echo "  3. Add your images to public/images/"
echo "  4. Edit src/layouts/BaseLayout.astro with your analytics IDs"
echo "  5. Update src/components/Nav.astro menu items"
echo "  6. Update src/components/Footer.astro links and info"
echo "  7. Edit src/content.config.ts to match your content types"
echo "  8. Copy .env.local.example to .env.local and fill in keys"
echo "  9. Run: npm install && npm run dev"
echo ""
