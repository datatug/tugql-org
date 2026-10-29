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
  });

  it('keeps every host attached as a custom domain (host redirects are zone rules)', () => {
    assert.deepEqual(
      config.routes.map((r) => r.pattern).sort(),
      ['dtql.org', 'tugql.org', 'www.dtql.org', 'www.tugql.org'],
    );
    assert.ok(config.routes.every((r) => r.custom_domain === true));
  });

  it('ships the landing page, robots and sitemap', () => {
    for (const f of ['index.html', 'robots.txt', 'sitemap.xml', 'styles.css']) {
      assert.ok(existsSync(resolve(root, 'public', f)), `missing public/${f}`);
    }
  });

  it('ships all 14 localized landing pages with metadata and language switchers', async () => {
    const { langs, localeHref, canonicalUrl } = await import('../tools/languages.mjs');
    const { translations } = await import('../tools/translations.mjs');
    assert.equal(langs.length, 14);

    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');

    for (const lang of langs) {
      const pageRelPath = lang.code === 'en' ? 'public/index.html' : `public/${lang.code}/index.html`;
      const fullPath = resolve(root, pageRelPath);
      assert.ok(existsSync(fullPath), `missing ${pageRelPath}`);

      const html = readFileSync(fullPath, 'utf8');

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

      // html lang and canonical
      assert.match(html, new RegExp(`<html lang="${lang.tag}">`), `${lang.code} missing correct html lang`);
      assert.match(html, new RegExp(`<link rel="canonical" href="${canonicalUrl(lang.code)}" />`), `${lang.code} missing canonical`);

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
    }
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
