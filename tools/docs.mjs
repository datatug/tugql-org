import { gettingStarted } from './docs/getting-started.mjs';
import { syntax } from './docs/syntax.mjs';
import { tugqt } from './docs/tugqt.mjs';
import { crossDatabase } from './docs/cross-database.mjs';
import { spec } from './docs/spec.mjs';
import { faq } from './docs/faq.mjs';
import { comparePrql } from './docs/tugql-vs-prql.mjs';

export const docPages = [gettingStarted, syntax, tugqt, crossDatabase, spec, faq, comparePrql];
const origin = 'https://tugql.org';

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shell({ title, description, canonical, body }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${safeTitle} | TugQL</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle} | TugQL" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${origin}/og-card.png" />
  <meta property="og:image:alt" content="TugQL" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle} | TugQL" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${origin}/og-card.png" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/docs.css" />
</head>
<body>
  <header class="AppHeader"><div class="AppHeader-inner"><a class="AppHeader-brand" href="/"><span class="AppHeader-brand-mark" aria-hidden="true">{}</span><span class="AppHeader-brand-word">TugQL</span></a><nav class="AppHeader-nav" aria-label="Primary"><a href="/">Home</a><a href="/docs/">Docs</a><a href="https://github.com/tugql/tugql">Source</a></nav></div></header>
  <main class="container docs-page">
    ${body}
  </main>
  <footer class="AppFooter"><div class="container AppFooter-inner"><a href="/">TugQL</a><a href="https://github.com/tugql/tugql">Specification source</a></div></footer>
</body>
</html>`;
}

export function renderDocsIndex() {
  const links = docPages.map(page => `<li><a href="/docs/${page.slug}/">${escapeHtml(page.title)}</a><p>${escapeHtml(page.description)}</p></li>`).join('\n');
  return shell({
    title: 'TugQL documentation',
    description: 'English guides for TugQL text queries and the TugQT structured query tree, with links to the source references.',
    canonical: `${origin}/docs/`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Docs</nav><h1>TugQL documentation</h1><p>Start with a query, then follow the source references for precise behavior.</p><ul class="docs-list">${links}</ul>`,
  });
}

export function renderDocPage(page) {
  const body = page.sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2>${section.html}</section>`).join('\n');
  return shell({
    title: page.title,
    description: page.description,
    canonical: `${origin}/docs/${page.slug}/`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/docs/">Docs</a> / ${escapeHtml(page.title)}</nav><h1>${escapeHtml(page.title)}</h1><p class="docs-intro">${escapeHtml(page.description)}</p>${body}<p><a href="/docs/">All documentation</a></p>`,
  });
}
