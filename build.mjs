import { readFile, readdir, mkdir, rm, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ linkify: true, typographer: true });
const output = 'dist';
const base = `/${(process.env.SITE_BASE || '').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
const url = (pathname) => `${base}${pathname}`;
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function dateLabel(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function videoEmbed(link) {
  const parsed = new URL(link);
  const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1)
    : ['youtube.com', 'www.youtube.com'].includes(parsed.hostname) && parsed.pathname === '/watch'
      ? parsed.searchParams.get('v') : null;
  if (!id || !/^[\w-]{11}$/.test(id)) throw new Error(`Invalid YouTube URL: ${link}`);
  return `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
}

function layout({ title, description, body, page }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f8f7f4">
  <title>${escape(title)} · Scott Bolinger</title>
  <meta name="description" content="${escape(description)}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <link rel="stylesheet" href="${url('/assets/site.css')}">
</head>
<body class="${page}">
  <div class="site-shell">
    <header class="site-header">
      <nav aria-label="Main navigation" class="header-links"><a href="${url('/')}">Posts</a><a href="${url('/about/')}">About</a></nav>
      <a class="wordmark" href="${url('/')}" aria-label="Scott Bolinger, home">Scott Bolinger</a>
      <a class="header-external" href="https://www.youtube.com/@scottbolinger">YouTube</a>
    </header>
    <main>${body}</main>
    <footer class="site-footer"><a href="${url('/')}">Scott Bolinger</a><a href="${url('/about/')}">About</a></footer>
  </div>
</body>
</html>`;
}

const files = (await readdir('posts')).filter((name) => name.endsWith('.md'));
const posts = await Promise.all(files.map(async (name) => {
  const { data, content } = matter(await readFile(path.join('posts', name), 'utf8'));
  const slug = name.slice(0, -3);
  if (!/^[a-z0-9-]+$/.test(slug) || !data.title || !data.description || !data.date) {
    throw new Error(`Missing or invalid post metadata: ${name}`);
  }
  const date = new Date(data.date);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${name}`);
  const category = data.category || (data.youtube ? 'video' : 'essay');
  if (!['essay', 'video', 'podcast'].includes(category)) throw new Error(`Invalid category: ${name}`);
  return { slug, ...data, category, date, content };
}));
posts.sort((a, b) => b.date - a.date);
if (!posts.length) throw new Error('Add at least one Markdown post before building.');
const postLabel = (post) => ({ essay: 'Essay', video: 'Video', podcast: 'Podcast' })[post.category];

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
for (const asset of await readdir('assets')) {
  await copyFile(path.join('assets', asset), path.join(output, 'assets', asset));
}

for (const post of posts) {
  const cover = post.cover && !post.youtube ? `<img class="article-cover" src="${url(`/assets/${encodeURIComponent(post.cover)}`)}" alt="">` : '';
  const published = post.originalUrl
    ? `<p class="original-note">Originally published <time datetime="${post.date.toISOString().slice(0, 10)}">${dateLabel(post.date)}</time> on ${post.originalSource === 'Substack' ? `<a href="${escape(post.originalUrl)}">Substack</a>` : escape(post.originalSource)}.</p>`
    : `<time datetime="${post.date.toISOString().slice(0, 10)}">${dateLabel(post.date)}</time>`;
  const body = `<article class="article">
    <a class="back-link" href="${url('/')}">← All writing</a>
    <header class="article-header"><p class="eyebrow">${postLabel(post)}</p><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.description)}</p>${published}</header>
    ${cover}
    <div class="prose">${post.youtube ? videoEmbed(post.youtube) : ''}${markdown.render(post.content)}</div>
  </article>`;
  const directory = path.join(output, post.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), layout({ title: post.title, description: post.description, body, page: 'post-page' }));
}

const [featured, ...rest] = posts;
const postLink = (post) => url(`/${post.slug}/`);
const list = rest.length ? `<section class="more-posts" aria-labelledby="latest-title"><div class="section-heading"><p class="eyebrow">The journal</p><h2 id="latest-title">Latest posts</h2></div><div class="post-list">${rest.map((post) => `
  <a class="post-row" href="${postLink(post)}">${post.cover ? `<img src="${url(`/assets/${encodeURIComponent(post.cover)}`)}" alt="" loading="lazy">` : ''}<div class="post-row-copy"><span class="eyebrow">${postLabel(post)}</span><h3>${escape(post.title)}</h3><p>${escape(post.description)}</p><time datetime="${post.date.toISOString().slice(0, 10)}">${dateLabel(post.date)}</time></div></a>`).join('')}</div></section>` : '';
const homepage = `<article class="featured">${featured.cover ? `<a class="featured-image" href="${postLink(featured)}" aria-label="Read ${escape(featured.title)}"><img src="${url(`/assets/${encodeURIComponent(featured.cover)}`)}" alt=""></a>` : ''}<div class="featured-copy"><div><p class="eyebrow">Featured ${postLabel(featured).toLowerCase()}</p><h1><a href="${postLink(featured)}">${escape(featured.title)}</a></h1><p class="featured-description">${escape(featured.description)}</p></div><div class="featured-meta"><time datetime="${featured.date.toISOString().slice(0, 10)}">${dateLabel(featured.date)}</time><a href="${postLink(featured)}">${featured.youtube ? 'Watch video' : 'Read essay'}</a></div></div></article>
  ${list}`;
await writeFile(path.join(output, 'index.html'), layout({ title: 'Home', description: 'Scott Bolinger writes about software, AI, business, and building things.', body: homepage, page: 'home-page' }));
const eras = [
  { period: '2013–17', label: 'Building businesses', events: [
    ['2013', 'Co-founded AppPresser'],
    ['2015/16', 'Launched Reactor & WooCommerce Smart Checkout'],
    ['', 'AppPresser surpasses $1M in revenue (all-time)'],
    ['2017', 'Founded Holler Box'],
  ] },
  { period: '2022–23', label: 'Commerce at GoDaddy', events: [
    ['2022', 'Sold Holler Box'],
    ['2022', 'Joined GoDaddy as a Senior Software Engineer'],
    ['2022', 'Created a React component library adopted by internal teams'],
    ['2023', 'Built an API driven checkout product for Managed WooCommerce Stores'],
    ['2023', 'Won internal ideathon with an eCommerce AI assistant'],
  ] },
  { period: '2024–25', label: 'Airo and CASA', events: [
    ['2024', 'Built the AI assistant into a framework used across GoDaddy. Branded as Airo, it was featured at investor day (and powered 4 demos).'],
    ['2024', 'Won the One System internal award for my work on the AI framework'],
    ['2025', 'Helped create and launch CASA, a chat and voice AI sales agent'],
    ['2025', 'Received a special award from my org president'],
  ] },
  { period: '2026', label: 'Building in AI', events: [
    ['2026', 'CASA conversion rate achieves parity with human sales for a subsection of customers'],
    ['2026', 'Started [You’re Absolutely Right](https://www.youtube.com/@youareabsolutelyright), a podcast with Wes Cole, and my own [YouTube channel](https://www.youtube.com/@scottbolinger) focused on AI'],
    ['2026', 'Created [Gridrise.io](https://gridrise.io), a platform for building customer facing AI agents'],
    ['2026', 'Started contributing to Airo App Builder'],
  ] },
];
const timeline = `<section class="timeline" aria-labelledby="timeline-title"><div class="timeline-heading"><p class="eyebrow">The path so far</p><h2 id="timeline-title">Career timeline</h2></div><p class="timeline-hint">Scroll to explore →</p><div class="timeline-track" role="region" aria-label="Career timeline, scroll horizontally to read all eras" tabindex="0"><ol class="timeline-eras">${eras.map(({ period, label, events }) => `<li class="timeline-era"><div class="timeline-era-heading"><span class="timeline-period">${period}</span><h3>${label}</h3></div><ul>${events.map(([year, event]) => `<li>${year ? `<span class="timeline-year">${year}</span>` : ''}<span>${markdown.renderInline(event)}</span></li>`).join('')}</ul></li>`).join('')}</ol></div></section>`;
const about = `<section class="about"><div><p class="eyebrow">About</p><h1>Scott Bolinger</h1></div><div class="about-copy">${markdown.render(await readFile('about.md', 'utf8'))}</div></section><hr class="about-divider">${timeline}`;
await mkdir(path.join(output, 'about'), { recursive: true });
await writeFile(path.join(output, 'about', 'index.html'), layout({ title: 'About', description: 'About Scott Bolinger.', body: about, page: 'about-page' }));
console.log(`Built ${posts.length} post${posts.length === 1 ? '' : 's'} in ${output}/`);
