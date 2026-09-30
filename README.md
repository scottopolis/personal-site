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

Build with `SITE_BASE=personal-site npm run build` when previewing under a GitHub Pages project path. For `scottbolinger.com`, build without `SITE_BASE`.

The repository is public: only put finished, public content and assets here. Keep drafts and credentials elsewhere. Deployment and the custom domain are intentionally not configured yet, pending review of the design.
