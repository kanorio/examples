# Notes for AI coding agents

This is a Next.js App Router frontend for a Kanorio site. Kanorio is the backend: the site owner edits content in the Kanorio dashboard, and this app reads it (here, the blog) through the Content Delivery API.

## Working on this project

- Read content through `lib/kanorio.ts`: one Delivery client with cached reads that a signed webhook revalidates. Do not call the API with hand-built URLs.
- Settings live in `.env.local` (copy `.env.example`): the site's permanent system URL, its id and the server-only secrets. Never commit them, and never put a Kanorio API token (`knr_pat_...`) or the server key in browser code or `NEXT_PUBLIC_*` variables.
- After the site's content model changes, run `npm run types` to regenerate `types/kanorio.d.ts`.
- Without a site, `npm run mock` serves a small Content Delivery API, and `node mock/scenario.mjs` checks caching, webhook revalidation and SEO output against it (see README.md).
- With the Kanorio MCP server connected (`https://app.kanorio.com/api/mcp`), call `sites_context` first: it returns the site's Delivery endpoints and what content exists.

## Changing the look

To give the site a finished design, use one of Kanorio's free website styles (design systems with a live sample site): with the Kanorio MCP server connected, call `skills_search`, show the user two or three options with their preview links, then call `skills_get` for the one they pick and follow its SKILL.md; without MCP, browse https://kanorio.com/skills. Apply the style to the existing pages and components, and keep `lib/kanorio.ts` and the routes as they are so content keeps coming from Kanorio.

## Where to read more

- How an AI tool works with Kanorio, step by step: https://kanorio.com/headless/skill.md
- The Next.js guide this project comes from: https://kanorio.com/en/developers/guides/nextjs.md
- Developer docs (add `.md` to any page for Markdown): https://kanorio.com/en/developers
