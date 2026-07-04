// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const SITE = 'https://example.com';

function readFrontmatter(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let [, key, value] = m;
    value = value.trim().replace(/^["']|["']$/g, '');
    if (value === 'true') fm[key] = true;
    else if (value === 'false') fm[key] = false;
    else if (value !== '') fm[key] = value;
  }
  return fm;
}

function buildLastmodMap() {
  const map = new Map();

  const sources = [
    { dir: 'src/content/blog', urlPrefix: '/blog/' },
    { dir: 'src/content/case-studies', urlPrefix: '/case-studies/' },
  ];

  for (const { dir, urlPrefix } of sources) {
    let files;
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!/\.(md|mdx)$/.test(file)) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');
      const fm = readFrontmatter(path.join(dir, file));
      if (fm.draft === true) continue;
      const date = fm.lastModified || fm.publishDate;
      if (!date) continue;
      const iso = new Date(date).toISOString();
      const url = `${SITE}${urlPrefix}${slug}/`;
      map.set(url, iso);
    }
  }

  return map;
}

const lastmodMap = buildLastmodMap();

export default defineConfig({
  adapter: vercel({ maxDuration: 10 }),
  // Conventional /sitemap.xml path → the actual Astro-generated sitemap index.
  redirects: {
    '/sitemap.xml': '/sitemap-index.xml',
  },
  integrations: [tailwind(), sitemap({
    serialize(item) {
      const fromFrontmatter = lastmodMap.get(item.url);
      item.lastmod = fromFrontmatter ?? new Date().toISOString();
      return item;
    },
  })],
  site: SITE,
});
