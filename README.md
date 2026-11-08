# tugql-org

Source code for **[tugql.org](https://tugql.org)** (formerly **dtql.org**) — documentation, tutorials, specification references, and canonical project website.

## Overview

- **Canonical URL:** [https://tugql.org](https://tugql.org)
- **Former domain:** `dtql.org` (permanently redirected with HTTP 301 preserving paths and query strings)
- **Product:** TugQL — portable, human-readable query language and structured query tree (TugQT)

## Architecture & Deployment

The site is served by an assets-only Cloudflare Worker with static assets in `public/`.
- No Worker script: requests are served by free static assets. Unknown URLs return `public/404.html` with HTTP 404.
- Host redirects are zone Redirect Rules, not Worker code. `www.tugql.org`, `dtql.org`, and `www.dtql.org` must 301 to `https://tugql.org` with the path and query preserved. The exact rules are in [DEPLOY.md](DEPLOY.md).
- Canonical metadata, hreflang, sitemap, `robots.txt`, and `llms.txt` all reference `https://tugql.org`.

## Localization (i18n)

The website is localized into 10 major languages following the [specscore.md design principles](https://github.com/specscore/specscore):
- Native-language labels only (no flag emoji).
- Header language dropdown and full-width footer language tabs with crawler-discoverable `<a hreflang>` DOM links.
- Canonical URLs, per-locale alternate links, and complete XML sitemap with hreflang alternates.

Supported languages:
- **English** (`/` — canonical default)
- **Español** (`/es/`)
- **Deutsch** (`/de/`)
- **Français** (`/fr/`)
- **Português (BR)** (`/pt-br/`)
- **Русский** (`/ru/`)
- **Українська** (`/uk/`)
- **日本語** (`/ja/`)
- **中文** (`/zh-cn/`)
- **한국어** (`/ko/`)

To regenerate localized pages and sitemap:
```sh
npm run build
npm test
```
