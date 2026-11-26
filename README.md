# Kanorio examples

Working front ends for [Kanorio](https://kanorio.com), one per folder. Each one is the code from a guide in the [developer documentation](https://kanorio.com/en/developers), unchanged, and is built and run against every release of `@kanorio/sdk` and `@kanorio/cli`.

| Folder | What it is | Guide |
|---|---|---|
| [`nextjs-blog`](./nextjs-blog) | A Next.js App Router blog: cached reads, webhook revalidation, draft mode, SEO files, edge redirects | [Next.js](https://kanorio.com/en/developers/guides/nextjs), [Next.js with Cache Components](https://kanorio.com/en/developers/guides/nextjs-cache-components) |

## Start from an example

```bash
npx create-next-app@latest my-site --example "https://github.com/kanorio/examples/tree/main/nextjs-blog"
```

Then follow the README in the folder. Every example also runs without a Kanorio site, against a small mock of the Content Delivery API that ships with it.

## Changes

This repository is published from Kanorio's own source and is overwritten on every update, so pull requests cannot be merged here. To report a problem or ask for an example, open an issue.

## License

MIT No Attribution (MIT-0): you can use, change and sell what you build from these examples without crediting Kanorio or keeping a license notice. See [LICENSE](./LICENSE).
