import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { HERO_QUERY, highlightTugQL, tryInDataTugUrl } from '../tools/hero.mjs';
import { langs } from '../tools/languages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = (code) => resolve(root, 'public', code === 'en' ? 'index.html' : `${code}/index.html`);

function decodeTryUrl(url) {
  const prefix = 'https://datatug.app/try#tugql=';
  assert.ok(url.startsWith(prefix), url);
  const payload = url.slice(prefix.length);
  assert.match(payload, /^[A-Za-z0-9_-]+$/, 'unpadded base64url');
  return gunzipSync(Buffer.from(payload, 'base64url')).toString('utf8');
}

function unhighlight(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

describe('hero "Try in DataTug.app" button', () => {
  it('links to the /try fragment carrying the hero query byte for byte', () => {
    assert.equal(decodeTryUrl(tryInDataTugUrl(HERO_QUERY)), HERO_QUERY);
  });

  it('builds the same link on every run', () => {
    assert.equal(tryInDataTugUrl(HERO_QUERY), tryInDataTugUrl(HERO_QUERY));
  });

  it('highlights without changing the text', () => {
    assert.equal(unhighlight(highlightTugQL(HERO_QUERY)), HERO_QUERY);
    assert.equal(unhighlight(highlightTugQL("a < 'x''y' & -- c")), "a < 'x''y' & -- c");
  });

  for (const lang of langs) {
    it(`${lang.code}: the button sends exactly the query the page shows`, () => {
      const html = readFileSync(pagePath(lang.code), 'utf8');
      const shown = html.match(/<pre><code>([\s\S]*?)<\/code><\/pre>\s*<div class="codeblock-foot">/);
      assert.ok(shown, 'hero code block with a footer');
      assert.equal(unhighlight(shown[1]), HERO_QUERY);
      const href = html.match(/<a [^>]*href="([^"]+)"[^>]*data-try-in-datatug>/);
      assert.ok(href, 'Try in DataTug.app link');
      assert.equal(decodeTryUrl(href[1]), HERO_QUERY);
    });
  }
});
