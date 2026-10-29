import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { langs, localeHref, canonicalUrl } from './languages.mjs';
import { translations } from './translations.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const publicDir = resolve(rootDir, 'public');

function renderPage(lang) {
  const t = translations[lang.code];
  if (!t) throw new Error(`Missing translations for language code: ${lang.code}`);

  const canonical = canonicalUrl(lang.code);
  const homeHref = localeHref(lang.code);

  const alternateLinks = [
    ...langs.map((l) => `<link rel="alternate" hreflang="${l.tag}" href="${canonicalUrl(l.code)}" />`),
    `<link rel="alternate" hreflang="x-default" href="https://tugql.org/" />`
  ].map(line => `  ${line}`).join('\n');

  const langSwitcherOptions = langs.map((l) => {
    const isActive = l.code === lang.code;
    return `        <li role="none"><a href="${localeHref(l.code)}" hreflang="${l.tag}" lang="${l.tag}" role="menuitem" class="lang-switcher__item${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>${l.label}</a></li>`;
  }).join('\n');

  const footerLangsList = langs.map((l) => {
    const isActive = l.code === lang.code;
    return `        <li><a href="${localeHref(l.code)}" hreflang="${l.tag}" lang="${l.tag}" class="footer-langs__tab${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>${l.label}</a></li>`;
  }).join('\n');

  const mappingRows = t.mapping.rows.map((r) => {
    return `          <tr><td>${r.node}</td><td>${r.rep}</td></tr>`;
  }).join('\n');

  const whyCards = t.why.cards.map((c, i) => {
    const icons = [
      // 1. Human-readable (document icon)
      `<path fill="currentColor" d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25ZM3.5 6.25a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.25h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z"/>`,
      // 2. Lossless round-trip (sync/reload icon)
      `<path fill="currentColor" d="M1.643 3.143 .427 1.927A.25.25 0 0 0 0 2.104V5.75a.25.25 0 0 0 .25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684Z"/>`,
      // 3. Schema-validated (shield-check icon)
      `<path fill="currentColor" d="M8.533.133a1.75 1.75 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48V7c0 1.566.32 3.182 1.303 4.682.983 1.498 2.585 2.813 5.032 3.855a1.7 1.7 0 0 0 1.33 0c2.447-1.042 4.049-2.357 5.032-3.855C14.68 10.182 15 8.566 15 7V3.48a1.75 1.75 0 0 0-1.217-1.667ZM7.92 1.563a.25.25 0 0 1 .16 0l5.25 1.68a.25.25 0 0 1 .17.237V7c0 1.36-.275 2.666-1.057 3.86-.784 1.194-2.121 2.34-4.366 3.297a.2.2 0 0 1-.154 0c-2.245-.957-3.582-2.103-4.366-3.297C2.775 9.666 2.5 8.36 2.5 7V3.48a.25.25 0 0 1 .17-.237Z"/>`,
      // 4. Diff-friendly (git-commit / branch icon)
      `<path fill="currentColor" d="M5 3.254V3.25v.005a.75.75 0 1 1 0-.005v.004Zm.45 1.9a2.25 2.25 0 1 0-1.95.218v5.256a2.25 2.25 0 1 0 1.5 0V7.123A5.735 5.735 0 0 0 9.25 9h1.378a2.251 2.251 0 1 0 0-1.5H9.25a4.25 4.25 0 0 1-3.8-2.346ZM12.75 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-8.5 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"/>`,
      // 5. Portable by design (link icon)
      `<path fill="currentColor" d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z"/>`,
      // 6. Not full SQL (code/filter icon)
      `<path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z"/>`
    ];
    return `      <article class="Box why-card">
        <div class="why-icon">
          <svg class="octicon" viewBox="0 0 16 16" width="20" height="20" aria-hidden="true">${icons[i]}</svg>
        </div>
        <h3>${c.title}</h3>
        <p>${c.body}</p>
      </article>`;
  }).join('\n\n');

  const implCards = t.implementations.cards.map((c) => {
    return `      <li><a class="adapter Box${c.url.includes('tugql/tugql') ? ' adapter-core' : ''}" href="${c.url}" rel="noopener">
        <span class="adapter-kind">${c.badge}</span>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <span class="adapter-meta">${c.meta}</span>
      </a></li>`;
  }).join('\n');

  return `<!doctype html>
<html lang="${lang.tag}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${t.meta.title}</title>
  <meta name="description" content="${t.meta.description}" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="canonical" href="${canonical}" />
${alternateLinks}
  <meta property="og:title" content="${t.meta.title}" />
  <meta property="og:description" content="${t.meta.ogDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230d1117'/><text x='50%25' y='53%25' text-anchor='middle' dominant-baseline='middle' font-family='ui-monospace,monospace' font-size='22' font-weight='800' fill='%232f81f7'>{}</text></svg>" />
  <link rel="stylesheet" href="/styles.css" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TugQL",
    "url": "https://tugql.org",
    "description": "${t.meta.jsonLdDescription}",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform"
  }
  </script>
</head>
<body>

<!-- ============================ APP HEADER ============================ -->
<header class="AppHeader" role="banner">
  <div class="AppHeader-inner">
    <a class="AppHeader-brand" href="#top" aria-label="TugQL home">
      <span class="AppHeader-brand-mark" aria-hidden="true">{}</span>
      <span class="AppHeader-brand-word">TugQL</span>
    </a>

    <nav class="AppHeader-context" aria-label="Context">
      <span class="AppHeader-context-slash" aria-hidden="true">/</span>
      <a class="AppHeader-context-item" href="https://github.com/tugql/tugql" rel="noopener">
        tugql/tugql
      </a>
    </nav>

    <nav class="AppHeader-nav" aria-label="Primary">
      <a href="#why">${t.nav.why}</a>
      <a href="#example">${t.nav.example}</a>
      <a href="#mapping">${t.nav.mapping}</a>
      <a href="#scope">${t.nav.scope}</a>
      <a href="#stack">${t.nav.stack}</a>
      <a href="#implementations">${t.nav.implementations}</a>
    </nav>

    <div class="AppHeader-actions">
      <a class="btn btn-default btn-sm" href="https://github.com/tugql/tugql" rel="noopener">
        <svg class="octicon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
        <span>${t.nav.star}</span>
      </a>

      <!-- Language dropdown -->
      <div class="lang-switcher">
        <button
          type="button"
          class="lang-switcher__trigger"
          aria-haspopup="true"
          aria-expanded="false"
          lang="${lang.tag}"
        >
          <span>${lang.label}</span>
          <svg class="lang-switcher__caret" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <ul class="lang-switcher__menu" role="menu" aria-label="Language">
${langSwitcherOptions}
        </ul>
      </div>
    </div>
  </div>
</header>

<main id="top">

<!-- ============================ HERO ============================ -->
<section class="hero">
  <div class="container hero-grid">

    <div class="hero-left">
      <div class="hero-eyebrow">
        <svg class="octicon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm9.22 3.72a.75.75 0 0 0 0 1.06L10.69 8 9.22 9.47a.75.75 0 1 0 1.06 1.06l2-2a.75.75 0 0 0 0-1.06l-2-2a.75.75 0 0 0-1.06 0M6.78 6.53a.75.75 0 0 0-1.06-1.06l-2 2a.75.75 0 0 0 0 1.06l2 2a.75.75 0 1 0 1.06-1.06L5.31 8Z"/></svg>
        ${t.hero.eyebrow}
      </div>

      <h1 class="hero-title">
        <span class="hero-line">${t.hero.titleLine1}</span>
        <span class="hero-line"><span class="hero-accent">${t.hero.titleAccent}</span>${t.hero.titleLine2}</span>
      </h1>

      <p class="hero-lede">
        ${t.hero.lede}
      </p>

      <div class="hero-cta">
        <a class="btn btn-primary" href="https://github.com/tugql/tugql" rel="noopener">
          <svg class="octicon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75V1.75Z"/></svg>
          ${t.hero.readSpec}
        </a>
        <a class="btn btn-default" href="#example">${t.hero.seeExample}</a>
        <code class="hero-install" tabindex="0">
          <span class="hero-install-prompt">$</span> go get github.com/dal-go/dalgo/tugql
        </code>
      </div>
    </div>

    <!-- Hero code sample -->
    <div class="codeblock" role="figure" aria-label="${t.hero.codeSampleAria}">
      <div class="codeblock-head">
        <span class="codeblock-dot" style="background:#ff5f57"></span>
        <span class="codeblock-dot" style="background:#febc2e"></span>
        <span class="codeblock-dot" style="background:#28c840"></span>
        <span class="codeblock-name">query.tugql</span>
        <span class="codeblock-lang">TugQL</span>
      </div>
<pre><code><span class="pl-k">from</span> users <span class="pl-k">as</span> u
<span class="pl-k">select</span>
  u.name,
  u.age <span class="pl-k">as</span> years
<span class="pl-k">where</span>
  u.age &gt;= <span class="pl-c1">18</span>
  <span class="pl-k">and</span> (u.status <span class="pl-k">in</span> (<span class="pl-s">'active'</span>, <span class="pl-s">'pending'</span>) <span class="pl-k">or</span> u.country == <span class="pl-s">'US'</span>)
<span class="pl-k">order by</span>
  u.name,
  u.age <span class="pl-k">desc</span>
<span class="pl-k">limit</span> <span class="pl-c1">10</span>
<span class="pl-k">offset</span> <span class="pl-c1">20</span></code></pre>
    </div>

  </div>
</section>

<!-- ============================ WHY ============================ -->
<section id="why" class="section">
  <div class="container">
    <header class="section-head">
      <span class="section-eyebrow">${t.why.eyebrow}</span>
      <h2 class="section-title">${t.why.title}</h2>
      <p class="section-kicker">${t.why.kicker}</p>
    </header>

    <div class="why-grid">
${whyCards}
    </div>
  </div>
</section>

<!-- ============================ EXAMPLE ============================ -->
<section class="section section-subtle" id="example">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">${t.example.eyebrow}</span>
      <h2 class="section-title">${t.example.title}</h2>
      <p class="section-kicker">${t.example.kicker}</p>
    </div>
    <div class="iface-grid">
      <div class="iface-prose">
        <p>${t.example.p1}</p>
        <p>${t.example.p2}</p>
        <div class="Flash" role="note">
          <svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>
          <span><strong>${t.example.noteTitle}</strong> ${t.example.noteText}</span>
        </div>
      </div>

      <div class="codeblock" role="figure" aria-label="${t.example.codeSampleAria}">
        <div class="codeblock-head">
          <span class="codeblock-dot" style="background:#ff5f57"></span>
          <span class="codeblock-dot" style="background:#febc2e"></span>
          <span class="codeblock-dot" style="background:#28c840"></span>
          <span class="codeblock-name">users.tugqt.yaml</span>
          <span class="codeblock-lang">YAML</span>
        </div>
<pre><code><span class="pl-en">from</span>:
  <span class="pl-en">name</span>: users
<span class="pl-en">columns</span>:
  - <span class="pl-en">field</span>: name
  - <span class="pl-en">field</span>: age
    <span class="pl-en">as</span>: years
<span class="pl-en">where</span>:
  <span class="pl-en">and</span>:
    - <span class="pl-en">op</span>: <span class="pl-s">'&gt;='</span>
      <span class="pl-en">left</span>:
        <span class="pl-en">field</span>: age
      <span class="pl-en">right</span>:
        <span class="pl-en">value</span>: <span class="pl-c1">18</span>
    - <span class="pl-en">or</span>:
        - <span class="pl-en">op</span>: In
          <span class="pl-en">left</span>:
            <span class="pl-en">field</span>: status
          <span class="pl-en">right</span>:
            <span class="pl-en">values</span>:
              - active
              - pending
        - <span class="pl-en">op</span>: ==
          <span class="pl-en">left</span>:
            <span class="pl-en">field</span>: country
          <span class="pl-en">right</span>:
            <span class="pl-en">value</span>: US
<span class="pl-en">orderBy</span>:
  - <span class="pl-en">field</span>: name
  - <span class="pl-en">field</span>: age
    <span class="pl-en">desc</span>: <span class="pl-c1">true</span>
<span class="pl-en">limit</span>: <span class="pl-c1">10</span>
<span class="pl-en">offset</span>: <span class="pl-c1">20</span></code></pre>
      </div>
    </div>
  </div>
</section>

<!-- ============================ MAPPING ============================ -->
<section class="section" id="mapping">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">${t.mapping.eyebrow}</span>
      <h2 class="section-title">${t.mapping.title}</h2>
      <p class="section-kicker">${t.mapping.kicker}</p>
    </div>
    <div class="tugql-table-wrap Box">
      <table class="tugql-table">
        <thead><tr><th>${t.mapping.thNode}</th><th>${t.mapping.thRep}</th></tr></thead>
        <tbody>
${mappingRows}
        </tbody>
      </table>
    </div>
    <p style="margin-top:16px;color:var(--fg-muted)">${t.mapping.caption}</p>
  </div>
</section>

<!-- ============================ SCOPE ============================ -->
<section class="section section-subtle" id="scope">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">${t.scope.eyebrow}</span>
      <h2 class="section-title">${t.scope.title}</h2>
      <p class="section-kicker">${t.scope.kicker}</p>
    </div>
    <div class="why-grid">
      <div class="Box why-card">
        <h3>${t.scope.inScopeTitle}</h3>
        <p>${t.scope.inScopeBody}</p>
      </div>
      <div class="Box why-card">
        <h3>${t.scope.outScopeTitle}</h3>
        <p>${t.scope.outScopeBody}</p>
      </div>
      <div class="Box why-card">
        <h3>${t.scope.losslessTitle}</h3>
        <p>${t.scope.losslessBody}</p>
      </div>
    </div>
  </div>
</section>

<!-- ============================ STACK ============================ -->
<section class="section" id="stack">
  <div class="container">
    <div class="iface-grid">
      <div class="section-head" style="margin:0">
        <span class="section-eyebrow">${t.stack.eyebrow}</span>
        <h2 class="section-title">${t.stack.title}</h2>
        <p class="section-kicker">${t.stack.kicker}</p>
        <p style="margin-top:16px;color:var(--fg-muted)">${t.stack.p}</p>
      </div>

      <div class="flow" aria-label="${t.stack.flowAria}">
        <div class="flow-node flow-node-accent"><strong>${t.stack.tugqlLabel}</strong><span>${t.stack.tugqlSub}</span></div>
        <div class="flow-arrow" aria-hidden="true">&darr;</div>
        <div class="flow-node"><strong>${t.stack.dalgoLabel}</strong><span>${t.stack.dalgoSub}</span></div>
        <div class="flow-arrow" aria-hidden="true">&darr;</div>
        <div class="flow-backends">
          <span>inGitDB</span>
          <span>SQLite</span>
          <span>PostgreSQL</span>
          <span>Firestore</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============================ IMPLEMENTATIONS ============================ -->
<section class="section section-subtle" id="implementations">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">${t.implementations.eyebrow}</span>
      <h2 class="section-title">${t.implementations.title}</h2>
      <p class="section-kicker">${t.implementations.kicker}</p>
    </div>
    <ul class="adapter-grid" role="list">
${implCards}
    </ul>
  </div>
</section>

<!-- ============================ CLOSING ============================ -->
<section class="section section-subtle" id="datatug-development">
  <div class="container">
    <div class="section-head">
      <span class="section-eyebrow">${t.datatug.eyebrow}</span>
      <h2 class="section-title">${t.datatug.title}</h2>
      <p class="section-kicker">${t.datatug.kicker}</p>
    </div>
  </div>
</section>

<section class="section closing">
  <div class="container closing-inner">
    <h2>${t.closing.title}</h2>
    <p>${t.closing.p}</p>
    <div class="closing-cta">
      <a class="btn btn-primary" href="https://github.com/tugql/tugql" rel="noopener">${t.closing.readSpec}</a>
      <a class="btn btn-default" href="https://github.com/dal-go/dalgo/tree/main/tugql" rel="noopener">${t.closing.getLibrary}</a>
    </div>
  </div>
</section>

</main>

<!-- ============================ LANGUAGE SWITCHER PANEL ============================ -->
<nav class="footer-langs" aria-label="Language">
  <div class="footer-langs__inner">
    <ul class="footer-langs__list">
${footerLangsList}
    </ul>
  </div>
</nav>

<!-- ============================ FOOTER ============================ -->
<footer class="AppFooter">
  <div class="container AppFooter-inner">
    <ul role="list">
      <li>&copy; <span id="year">2026</span> TugQL contributors</li>
      <li><a href="https://github.com/tugql/tugql" rel="noopener">${t.footer.spec}</a></li>
      <li><a href="https://github.com/dal-go/dalgo/tree/main/tugql" rel="noopener">${t.footer.goImpl}</a></li>
      <li><a href="#example">${t.footer.example}</a></li>
      <li><a href="#mapping">${t.footer.mapping}</a></li>
    </ul>
    <span class="AppFooter-tag">${t.footer.tag}</span>
  </div>
</footer>

<button type="button" class="btn btn-default site-feedback" data-feedback-launcher aria-haspopup="dialog" hidden>${t.feedback}</button>
<script id="site-feedback-widget" defer src="https://improveit.now/widget.js" referrerpolicy="no-referrer" data-app="c1815762a96f44bc1811c4ebf36e64c4" data-space="ao58m" data-lang="${lang.code === 'ru' ? 'ru' : 'en'}" data-launcher="hidden" data-screen="landing"></script>
<script defer src="/feedback.js"></script>

<script>
  document.getElementById('year').textContent = new Date().getFullYear();

  // Accessibility and behavior for the header language dropdown
  document.querySelectorAll('.lang-switcher').forEach((switcher) => {
    const trigger = switcher.querySelector('.lang-switcher__trigger');
    if (!trigger) return;
    const sync = (open) => trigger.setAttribute('aria-expanded', String(open));
    switcher.addEventListener('mouseenter', () => sync(true));
    switcher.addEventListener('mouseleave', () => {
      if (!switcher.contains(document.activeElement)) sync(false);
    });
    switcher.addEventListener('focusin', () => sync(true));
    switcher.addEventListener('focusout', (e) => {
      const next = e.relatedTarget;
      if (!next || !switcher.contains(next)) sync(false);
    });
    switcher.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        sync(false);
        trigger.focus();
        setTimeout(() => trigger.blur(), 0);
      }
    });
  });
</script>
</body>
</html>
`;
}

function renderSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = langs.map((lang) => {
    const loc = canonicalUrl(lang.code);
    const alternates = [
      ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.tag}" href="${canonicalUrl(l.code)}" />`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="https://tugql.org/" />`
    ].join('\n');

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang.code === 'en' ? '1.0' : '0.9'}</priority>
${alternates}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

export function buildAll() {
  console.log('Building TugQL.org localized pages...');

  for (const lang of langs) {
    const html = renderPage(lang);
    if (lang.code === 'en') {
      const targetPath = resolve(publicDir, 'index.html');
      writeFileSync(targetPath, html, 'utf8');
      console.log(`  -> wrote public/index.html (en)`);
    } else {
      const targetDir = resolve(publicDir, lang.code);
      mkdirSync(targetDir, { recursive: true });
      const targetPath = resolve(targetDir, 'index.html');
      writeFileSync(targetPath, html, 'utf8');
      console.log(`  -> wrote public/${lang.code}/index.html`);
    }
  }

  // Update sitemap.xml
  const sitemapContent = renderSitemap();
  writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemapContent, 'utf8');
  console.log(`  -> wrote public/sitemap.xml`);

  console.log('Build complete.');
}

buildAll();
