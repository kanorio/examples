# Kanorio blog on Next.js

A Next.js App Router blog that reads from Kanorio's Content Delivery API: cached reads, webhook revalidation, draft mode, SEO files, edge redirects.

Every file under `app/`, `lib/`, `next.config.ts` and `proxy.ts` is the code from the [Next.js guide](https://kanorio.com/en/developers/guides/nextjs), unchanged. `variants/cache-components/` holds the files that differ when you follow [Next.js with Cache Components](https://kanorio.com/en/developers/guides/nextjs-cache-components): copy them over the main ones.

## Run it against your site

```bash
npm install
cp .env.example .env.local   # fill in the site URL and secrets from the site's Frontend page
npm run types                # writes types/kanorio.d.ts from your site's collections
npm run dev
```

Route folders follow the paths Kanorio uses for the content (`path` on every item). The blog lives under `/blog` unless the site owner changed its base path.

## Media in post bodies (optional)

The post page renders `contentHtml`, which works without any JavaScript: images carry `srcset` and their size, videos and audio are native players, and attachments link to their download. The site owner also decides which images open in a zoom view and whether PDFs can be downloaded, and the API carries those decisions:

- `contentHtml` marks the images to zoom with `data-kanorio-lightbox="true"` (never an image inside a link) and library media with `data-kanorio-asset`.
- `segments` gives each gallery a resolved `lightbox`, hosted media an `assetId`, attachments a `downloadUrl`, and PDFs a `downloadUrl` that is `null` when downloads are off. Download URLs are absolute URLs on the Kanorio app host.

`components/article-body.tsx` shows both with plain components, no Elements and no CSS framework. Replace the `contentHtml` `<div>` in `app/blog/[slug]/page.tsx` with `<ArticleBody item={item} assets={assets} />` to open the marked images in a zoom view (`components/zoom.tsx`, a native `<dialog>`). Pass `renderMarkdown` with your Markdown renderer to draw `segments` instead, with your own gallery, player, PDF and file blocks. `third-post` in the mock has one of each. For ready-made lightbox, player and PDF reader components, see [Images and media on your frontend](https://kanorio.com/en/developers/guides/images-and-media).

## Run it without a site

`mock/delivery.mjs` answers like one site's Content Delivery API, with four published posts (`third-post` has a gallery, video, audio, a PDF and an attachment) and a fifth that is published while the check runs.

```bash
npm run mock                                         # http://127.0.0.1:4010
NEXT_PUBLIC_KANORIO_SITE_URL=http://127.0.0.1:4010 KANORIO_WEBHOOK_SECRET=whsec_example npm run dev
```

`node mock/scenario.mjs` builds the app, serves it against the mock and checks that reads are cached, that a signed webhook refreshes an edited post and brings in a post that was visited before it was published, and that titles, canonical URLs and share images come out right. Kanorio runs the same check against every SDK release.
