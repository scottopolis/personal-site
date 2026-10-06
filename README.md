# Scott Bolinger — personal site

A small static site built from Markdown. The homepage features the newest post, and additional posts appear below it in date order. The bio lives on a separate About page. Essays and video posts use the same article layout.

## Local preview

```sh
npm install
npm run build
python3 -m http.server 4173 --directory dist
```

Open the local server in your browser. The generated `dist/` directory is not committed.

## Add a post

Create `posts/your-slug.md`:

```md
---
title: Your title
date: 2026-09-29
description: A short summary for the homepage and link previews.
cover: your-image.webp
---

Your article in Markdown.
```

The cover is optional; place it in `assets/` when used. For a video post, add `youtube: https://www.youtube.com/watch?v=VIDEO_ID` to the front matter. The video embeds above the Markdown body, within the same article layout.

Use `category: podcast` for You're Absolutely Right uploads. Categories are `essay`, `video`, and `podcast`; when omitted, posts default to `video` if they have a YouTube URL, otherwise `essay`. These categories supply the visible post labels and can support filtering later. For imported videos, use the original publication date in America/Los_Angeles, not the import date.

Build with `SITE_BASE=personal-site npm run build` when previewing under a GitHub Pages project path. For `scottbolinger.com`, build without `SITE_BASE`.

## Deployment

GitHub Pages publishes `dist/` through `.github/workflows/pages.yml` on pushes to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The workflow gets the URL base path from GitHub Pages, supporting both the temporary project URL and a custom domain.

Before switching the domain, test the site at https://scottopolis.github.io/personal-site/.

To switch to `scottbolinger.com`:

1. Verify the domain in your GitHub account's Pages settings using GitHub's TXT record.
2. Set `scottbolinger.com` as the custom domain in the repository's Pages settings, then rerun the deployment workflow so links build for the domain root.
3. At your DNS provider, point the apex (`@`) to GitHub Pages using the four A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. Replace conflicting website A/AAAA records; preserve mail and verification records.
4. Point `www` to `scottopolis.github.io` using a CNAME record (no repository path).
5. Once GitHub provisions the certificate, enable **Enforce HTTPS** and test both the apex and `www` addresses before retiring WordPress hosting.

See [GitHub's custom domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). A `CNAME` file is not required for this Actions-based deployment.

The repository is public: only put finished, public content and assets here. Keep drafts and credentials elsewhere.
