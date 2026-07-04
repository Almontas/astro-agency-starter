import { execSync } from 'node:child_process';

/**
 * Build-time last-modified date for a page, derived from its most recent git
 * commit (YYYY-MM-DD). Used by service pages so JSON-LD dateModified tracks
 * real edits instead of a hardcoded date.
 *
 * Pass the repo-relative source path as a literal (e.g.
 * 'src/pages/services/paid-media.astro') — import.meta.url is unusable here
 * because prerendering runs from the bundled dist file, not the source.
 *
 * Vercel clones shallowly, so a file untouched within the clone depth yields
 * no commit; the caller's fallback (the last known edit date) is used then.
 */
export function gitLastModified(repoRelativePath, fallback) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${repoRelativePath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || fallback;
  } catch {
    return fallback;
  }
}
