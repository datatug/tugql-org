import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// wrangler.jsonc carries whole-line // comments; strip them before parsing.
const config = JSON.parse(
  readFileSync(resolve(root, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, ''),
);

describe('tugql.org is served as static assets only', () => {
  it('has no Worker script and no worker-first routing', () => {
    assert.equal(config.main, undefined);
    assert.equal(config.assets.run_worker_first, undefined);
    assert.equal(config.assets.binding, undefined);
    assert.equal(existsSync(resolve(root, 'src/index.ts')), false);
    assert.equal(config.assets.directory, './public');
    assert.equal(config.assets.not_found_handling, '404-page');
  });

  it('keeps every host attached as a custom domain (host redirects are zone rules)', () => {
    assert.deepEqual(
      config.routes.map((r) => r.pattern).sort(),
      ['dtql.org', 'tugql.org', 'www.dtql.org', 'www.tugql.org'],
    );
    assert.ok(config.routes.every((r) => r.custom_domain === true));
  });

  it('ships the landing page, robots and sitemap', () => {
    for (const f of ['index.html', '404.html', 'llms.txt', 'robots.txt', 'sitemap.xml', 'styles.css', 'og-card.png', '_headers']) {
      assert.ok(existsSync(resolve(root, 'public', f)), `missing public/${f}`);
    }
    assert.match(readFileSync(resolve(root, 'public/_headers'), 'utf8'), /Strict-Transport-Security: max-age=31536000/);
  });

  it('ships all 14 localized landing pages with metadata and language switchers', async () => {
    const { langs, localeHref, canonicalUrl } = await import('../tools/languages.mjs');
    const { translations } = await import('../tools/translations.mjs');
    assert.equal(langs.length, 14);

    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const descriptions = [];

    for (const lang of langs) {
      const pageRelPath = lang.code === 'en' ? 'public/index.html' : `public/${lang.code}/index.html`;
      const fullPath = resolve(root, pageRelPath);
      assert.ok(existsSync(fullPath), `missing ${pageRelPath}`);

      const html = readFileSync(fullPath, 'utf8');
      assert.match(html, /<h1 class="hero-title">\s*<span class="hero-name">TugQL<\/span>/);
      assert.match(html, /<meta property="og:image" content="https:\/\/tugql\.org\/og-card\.png" \/>/);
      assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
      assert.match(html, /href="https:\/\/github\.com\/dal-go\/dalgo-js"/);

      // One SDK and one accessible, localized custom trigger per generated page.
      assert.equal((html.match(/src="https:\/\/improveit\.now\/widget\.js"/g) || []).length, 1);
      const triggerTag = html.match(/<button[^>]*data-feedback-launcher[^>]*>/)?.[0];
      assert.match(triggerTag, /\baria-haspopup="dialog"/);
      assert.match(triggerTag, /\bhidden(?:\s|>)/);
      const trigger = html.match(/<button[^>]*data-feedback-launcher[^>]*>(.*?)<\/button>/s)?.[1];
      assert.ok(trigger, `missing feedback trigger for ${lang.code}`);
      assert.match(trigger, /<svg class="feedback-mark" aria-hidden="true" focusable="false"/);
      assert.equal(trigger.replace(/<svg.*?<\/svg>/s, ''), translations[lang.code].feedback);
      assert.match(html, /referrerpolicy="no-referrer" data-app="c1815762a96f44bc1811c4ebf36e64c4" data-space="ao58m"/);
      assert.ok(html.includes(`data-lang="${lang.code === 'ru' ? 'ru' : 'en'}" data-launcher="hidden" data-screen="landing"`));
      assert.equal((html.match(/src="\/feedback\.js"/g) || []).length, 1);

      // html lang, one self canonical, and a full hreflang set
      assert.match(html, new RegExp(`<html lang="${lang.tag}">`), `${lang.code} missing correct html lang`);
      const canonicals = html.match(/<link rel="canonical" href="([^"]+)" \/>/g) || [];
      assert.deepEqual(canonicals, [`<link rel="canonical" href="${canonicalUrl(lang.code)}" />`], `${lang.code} canonical`);
      assert.match(html, /<link rel="describedby" href="https:\/\/tugql\.org\/llms\.txt" \/>/);

      const description = html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1];
      assert.ok(description, `${lang.code} missing meta description`);
      assert.ok(
        description.length >= 120 && description.length <= 160,
        `${lang.code} meta description is ${description.length} chars`,
      );
      descriptions.push(description);

      const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)];
      assert.equal(hreflangs.length, langs.length + 1, `${lang.code} hreflang count`);
      const hreflangByTag = new Map(hreflangs.map((match) => [match[1], match[2]]));
      assert.equal(hreflangByTag.size, langs.length + 1, `${lang.code} duplicate hreflang`);
      assert.equal(hreflangByTag.get(lang.tag), canonicalUrl(lang.code), `${lang.code} self hreflang`);
      assert.equal(hreflangByTag.get('x-default'), 'https://tugql.org/');

      // hreflang alternates
      for (const l of langs) {
        assert.match(
          html,
          new RegExp(`<link rel="alternate" hreflang="${l.tag}" href="${canonicalUrl(l.code)}" />`),
          `${lang.code} missing hreflang alternate for ${l.code}`
        );
      }
      assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/tugql\.org\/" \/>/);

      // language switcher in header and footer
      assert.match(html, /class="lang-switcher"/, `${lang.code} missing .lang-switcher`);
      assert.match(html, /class="footer-langs"/, `${lang.code} missing .footer-langs`);
      assert.ok(html.includes(`<span>${lang.label}</span>`), `${lang.code} trigger missing native label`);

      // sitemap entry
      assert.ok(sitemap.includes(`<loc>${canonicalUrl(lang.code)}</loc>`), `sitemap missing ${lang.code}`);

      const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
      assert.equal(jsonLdBlocks.length, 1, `${lang.code} JSON-LD count`);
      const jsonLd = JSON.parse(jsonLdBlocks[0][1]);
      if (lang.code === 'en') {
        const graph = jsonLd['@graph'];
        assert.ok(Array.isArray(graph), 'homepage JSON-LD missing @graph');
        const byType = Object.fromEntries(graph.map((node) => [node['@type'], node]));
        for (const type of ['SoftwareApplication', 'Organization', 'WebSite', 'SoftwareSourceCode']) {
          assert.ok(byType[type], `homepage JSON-LD missing ${type}`);
        }
        assert.equal(byType.SoftwareSourceCode.codeRepository, 'https://github.com/tugql/tugql');
        assert.equal(byType.SoftwareSourceCode.url, 'https://github.com/tugql/tugql');
        assert.match(byType.SoftwareSourceCode.license, /^https:\/\/github\.com\/tugql\/tugql/);
        assert.equal(byType.Organization.url, 'https://tugql.org/');
        assert.deepEqual(byType.Organization.sameAs, ['https://github.com/tugql/tugql']);
        assert.equal(byType.WebSite.url, 'https://tugql.org/');
        assert.equal(byType.SoftwareApplication['@type'], 'SoftwareApplication');
      } else {
        assert.equal(jsonLd['@type'], 'SoftwareApplication', `${lang.code} JSON-LD`);
        assert.equal(jsonLd['@graph'], undefined);
      }
      assertLicenceMentionsLinkToRepo(html.replace(/<script\b[\s\S]*?<\/script>/gi, ''), lang.code);
    }

    assert.equal(new Set(descriptions).size, descriptions.length, 'meta descriptions must be unique');
    assert.doesNotMatch(sitemap, /404\.html/);
  });

  it('publishes a distinct tech stack page in every supported language', async () => {
    const { langs, localeHref, canonicalUrl } = await import('../tools/languages.mjs');
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const descriptions = new Set();
    for (const lang of langs) {
      const rel = lang.code === 'en' ? 'about/tech-stack/index.html' : `${lang.code}/about/tech-stack/index.html`;
      const html = readFileSync(resolve(root, 'public', rel), 'utf8');
      const canonical = canonicalUrl(lang.code, 'about/tech-stack/');
      assert.match(html, new RegExp(`<html lang="${lang.tag}">`));
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`));
      assert.ok(html.includes('<h1>'));
      assert.ok(html.includes('<meta property="og:image" content="https://tugql.org/og-card.png" />'));
      assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image" />'));
      const description = html.match(/<meta name="description" content="([^"]+)" \/>/)?.[1];
      assert.ok(description, `${lang.code} description`);
      assert.ok([...description].length >= 120 && [...description].length <= 160, `${lang.code} description length`);
      descriptions.add(description);
      assert.ok(html.includes('"@type":"AboutPage"'));
      assert.ok(html.includes('"@type":"BreadcrumbList"'));
      assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
      const home = readFileSync(resolve(root, 'public', lang.code === 'en' ? 'index.html' : `${lang.code}/index.html`), 'utf8');
      assert.ok(home.includes(`href="${localeHref(lang.code, 'about/tech-stack/')}"`));
    }
    assert.equal(descriptions.size, langs.length);
  });

  it('publishes crawlable English documentation URLs', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const home = readFileSync(resolve(root, 'public/index.html'), 'utf8');
    assert.match(home, /href="\/docs\/">Docs<\/a>/);
    assert.match(readFileSync(resolve(root, 'public/_redirects'), 'utf8'), /\/getting-started \/docs\/getting-started\/ 301/);
    for (const route of ['docs', 'docs/getting-started']) {
      const html = readFileSync(resolve(root, 'public', route, 'index.html'), 'utf8');
      assert.match(html, /<html lang="en">/);
      assert.match(html, /<h1>[^<]+<\/h1>/);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://tugql.org/${route}/" />`));
      assert.ok(sitemap.includes(`<loc>https://tugql.org/${route}/</loc>`));
    }
  });
});

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Google-Extended',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'cohere-ai',
  'Diffbot',
];

function parseRobots(text) {
  const groups = [];
  let current = null;
  const sitemap = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      current = null;
      continue;
    }
    const idx = line.indexOf(':');
    assert.ok(idx > 0, `robots.txt line missing colon: ${rawLine}`);
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'sitemap') {
      sitemap.push(value);
      continue;
    }
    if (field === 'user-agent') {
      if (!current) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
      continue;
    }
    assert.ok(current, `directive before user-agent: ${rawLine}`);
    if (field === 'allow') current.allow.push(value);
    else if (field === 'disallow') current.disallow.push(value);
    else assert.fail(`unexpected robots.txt field ${field}`);
  }
  return { groups, sitemap };
}

function assertLicenceMentionsLinkToRepo(text, label) {
  const mention = /open-source|open source|licen[cs]e/gi;
  for (const match of text.matchAll(mention)) {
    const window = text.slice(Math.max(0, match.index - 240), match.index + match[0].length + 240);
    assert.match(
      window,
      /https:\/\/github\.com\/tugql\/tugql/,
      `${label} mentions "${match[0]}" without linking to the public repo`,
    );
  }
}

describe('crawler discovery files', () => {
  it('allows every crawler, including named AI crawlers, and declares the sitemap', () => {
    const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
    assert.doesNotMatch(robots, /^\s*disallow\s*:/im);
    const { groups, sitemap } = parseRobots(robots);
    assert.deepEqual(sitemap, ['https://tugql.org/sitemap.xml']);

    const star = groups.find((group) => group.agents.includes('*'));
    assert.ok(star, 'missing User-agent: *');
    assert.deepEqual(star.allow, ['/']);
    assert.deepEqual(star.disallow, []);

    for (const bot of AI_CRAWLERS) {
      const group = groups.find((candidate) => candidate.agents.includes(bot));
      assert.ok(group, `robots.txt does not name ${bot}`);
      assert.ok(group.allow.includes('/'), `${bot} is not allowed`);
      assert.deepEqual(group.disallow, [], `${bot} has a Disallow`);
    }
  });

  it('publishes a plain-text llms.txt with the spec definition and locale links', async () => {
    const { langs, canonicalUrl } = await import('../tools/languages.mjs');
    const llms = readFileSync(resolve(root, 'public/llms.txt'), 'utf8');
    assert.match(llms, /^# TugQL\n/);
    assert.match(llms, /^> /m);
    assert.match(llms, /query language/);
    assert.match(llms, /TugQT/);
    assert.match(llms, /https:\/\/github\.com\/tugql\/tugql\b/);
    assert.match(llms, /https:\/\/github\.com\/tugql\/tugql\/blob\/main\/LICENSE/);
    assert.doesNotMatch(llms, /<!doctype|<html|<script/i);
    assert.doesNotMatch(llms, /\b\d[\d,]*\s*(stars?|users?|downloads?|customers?)\b/i);
    for (const lang of langs) {
      assert.ok(llms.includes(canonicalUrl(lang.code)), `llms.txt missing ${lang.code}`);
    }
    assertLicenceMentionsLinkToRepo(llms, 'llms.txt');
  });

  it('ships a real 404 document for not_found_handling', () => {
    const html = readFileSync(resolve(root, 'public/404.html'), 'utf8');
    assert.match(html, /<title>Page not found — TugQL<\/title>/);
    assert.match(html, /<meta name="robots" content="noindex" \/>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/tugql\.org\/404" \/>/);
    assert.match(html, /href="https:\/\/tugql\.org\/"/);
    assert.match(html, /href="https:\/\/github\.com\/tugql\/tugql"/);
    assert.equal(config.assets.not_found_handling, '404-page');
  });
});

describe('duplicate hosts redirect outside the Worker', () => {
  it('documents zone Redirect Rules that 301 www and dtql hosts to the apex', () => {
    const deploy = readFileSync(resolve(root, 'DEPLOY.md'), 'utf8');
    const wrangler = readFileSync(resolve(root, 'wrangler.jsonc'), 'utf8');
    for (const snippet of [
      'http*://www.tugql.org/*',
      'http*://dtql.org/*',
      'http*://www.dtql.org/*',
      'https://tugql.org/${2}',
      '301',
      'Preserve query string',
    ]) {
      assert.ok(deploy.includes(snippet), `DEPLOY.md missing ${snippet}`);
    }
    assert.match(wrangler, /Redirect Rules/);
    assert.equal(config.main, undefined);
    assert.equal(config.assets.run_worker_first, undefined);
  });
});

describe('feedback launcher readiness and ownership', () => {
  const source = readFileSync(resolve(root, 'public/feedback.js'), 'utf8');
  function fixture(widgetFactory) {
    const listeners = {};
    const button = { hidden: true, addEventListener: (type, fn) => { listeners[type] = fn; } };
    const embed = { addEventListener: (type, fn) => { listeners[type] = fn; } };
    const window = {};
    if (widgetFactory) window.ImproveIt = widgetFactory(embed);
    runInNewContext(source, { window, document: {
      querySelector: () => button, getElementById: () => embed,
    } });
    return { button, embed, window, listeners };
  }
  const owned = (embed, open) => ({ sourceScript: embed,
    appID: 'c1815762a96f44bc1811c4ebf36e64c4', spaceID: 'ao58m', open });

  it('stays hidden when the SDK fails, then opens after its load event', () => {
    const f = fixture();
    assert.equal(f.button.hidden, true);
    f.listeners.click();
    let opened = 0;
    f.window.ImproveIt = owned(f.embed, () => opened++);
    f.listeners.load();
    assert.equal(f.button.hidden, false);
    f.listeners.click();
    assert.equal(opened, 1);
  });

  it('handles the SDK loading before the controller', () => {
    assert.equal(fixture(embed => owned(embed, () => {})).button.hidden, false);
  });

  it('never exposes or opens a foreign or replaced widget instance', () => {
    for (const override of [{ sourceScript: {} }, { appID: 'foreign' }, { spaceID: 'foreign' }, { open: null }]) {
      let opened = 0;
      const f = fixture(embed => ({ ...owned(embed, () => opened++), ...override }));
      assert.equal(f.button.hidden, true);
      f.listeners.click();
      assert.equal(opened, 0);
    }
    const f = fixture(embed => owned(embed, () => {}));
    f.window.ImproveIt = { open: () => assert.fail('foreign SDK opened') };
    f.listeners.click();
  });
});
