# On Simplicity
Independent simple-living publication and Resource Partners directory. Astro static output, TypeScript, Tailwind CSS 4 + typography, self-hosted Lora / Source Sans 3 fonts, sitemap and RSS. Canonical: **https://www.onsimplicity.net/**; pages use trailing slashes.

## Development
Node 22.23.4+ (Node 24 LTS recommended). `npm ci`, `npm run dev`; `npm run check` and `npm run build`; `npm run preview` to inspect the generated site. Production output is `dist/`. No server adapter or client framework.

## Content
- `archive-manifest.json` is the 84-item route/title/category contract.
- Archive contract: `src/archive/<id>.json` (`{id,path,title,categories,description,body_html}`). Optional `src/archive/<yyyy>-<mm>-<slug>.md` also supports frontmatter `year`, `month`, `slug`, `title`, `description`, `categories`, `updated`, parsed with gray-matter and marked. JSON takes precedence for duplicate paths. Exact manifest paths are rendered by `src/pages/[year]/[month]/[slug]/index.astro`. New editorial publication date is November 21, 2026; the historical path is not a publication date.
- `src/partners/<slug>.json`: partner profiles. Required: slug, name, category, city, state, blurb. Optional/null: street, zip, phone, website, gbp_url, map_embed_src.
- `src/posts/<slug>.json`: publisher articles. Required: slug, title, description, h1, date, body_html. Optional/null: category, tags, partner, schema, featured_image, client_post_url. Default category Other, slug other. `schema` is emitted as supplied, `body_html` preserves links and HTML, external images use plain img. Partner files are not required for an article to build.
- `src/lib/content.ts` reads publisher JSON as raw text, catches parse errors, validates each entry and skips malformed/incomplete records with warnings. Filename must match slug. Only trusted editorial/publisher HTML should enter these directories.
- Hub: 24 alphabetized partners/page; partner projects and industry categories: 12/page; latest home stories: 10; RSS: 50; related archive stories: 3; recent partner articles: 5 excluding current. Archive category pages intentionally show every matching post (legacy category pagination redirects to their canonical category).
- `PUBLIC_CONTACT_EMAIL` enables the editorial email address on Contact. Without it, the page honestly states the channel is being prepared; no nonworking form is shown.

## Deployment contract
Vercel Astro preset, `npm run build`, output `dist`, production branch main. Set www as primary and configure bare-domain → www **301** in Vercel domains. `vercel.json` contains the exact guide’s legacy **301** rules with trailingSlash true; do not add cleanUrls, permanent:true or Astro redirects. HTTPS and slash normalization may be Vercel 308 responses. Unknown and French-era URLs must remain true 404s. No deployment, DNS, Search Console or external access work is performed by the local build.

## Verification
Run local publisher fixtures before release (valid partner + post, malformed JSON, nullable optional fields, pagination). Remove fixtures and rebuild. Audit `dist` for manifest paths, one H1, canonicals, schemas, link destinations, RSS and sitemap. After deployment verify HTTP chains, real 404 status and commit-triggered publishing. Do not publish sample businesses or invented identities.

## Launch status

Production: https://www.onsimplicity.net/ . GitHub main deploys automatically to Vercel. All 84 Markdown archive articles are live at the specified addresses. The production HTTP suite passed 208/208 checks. See [the actual redirect results](docs/redirects.csv) for old URL, final URL and status chain. Real push publishing, malformed JSON, null optionals, business profiles, RSS and sitemap were exercised; temporary test content was removed.

Artwork inventory: the homepage contains one original inline SVG illustration, authored for this site in src/pages/index.astro. No stock photography or repeated photos are used. All other pages are typographic until actual partner images are supplied.

Still needed: the contact mailbox and its delivery setup; Search Console property access/ownership verification and sitemap submission; the supplied disavow file for upload. The site does not pretend these are configured.
