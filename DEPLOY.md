# Deploying tugql.org to Cloudflare

This site is a static landing page served from `public/` with no Worker script (`wrangler.jsonc` has no `main`), so requests are served by
free static assets and never count against the Workers request quota. It deploys as an
**assets-only Cloudflare Worker**.

## Domains & Redirect Architecture

- **Canonical domain:** `https://tugql.org`
- **Duplicate hosts:** `www.tugql.org`, `dtql.org`, and `www.dtql.org` must not serve the site. Each one permanently redirects (**HTTP 301**) to `https://tugql.org` with the path preserved.

These host redirects are zone **Redirect Rules**, not Worker code. An assets-only Worker serves the same files on every custom domain. `run_worker_first` patterns match paths, not hostnames, and turning it on for every request would bill those requests. A `public/_redirects` rule is also path-based, so it would redirect `tugql.org` itself.

Alexander: in the Cloudflare dashboard, create one Single Redirect per zone. Use a wildcard pattern, status code **301**, and **Preserve query string** enabled. The `http*` source matches both HTTP and HTTPS; `${2}` is the path captured by the second `*`.

Zone `tugql.org`:

- Request URL: `http://tugql.org/*`
- Target URL: `https://tugql.org/${1}`
- Status code: 301
- Preserve query string: enabled

The apex HTTP rule is separate from the `www` rule below. The
`public/_headers` asset adds HSTS on HTTPS responses after deployment;
HSTS does not replace the first HTTP redirect.

- Request URL: `http*://www.tugql.org/*`
- Target URL: `https://tugql.org/${2}`
- Status code: 301
- Preserve query string: enabled

Zone `dtql.org` (two rules):

- Request URL: `http*://dtql.org/*`
- Target URL: `https://tugql.org/${2}`
- Status code: 301
- Preserve query string: enabled

- Request URL: `http*://www.dtql.org/*`
- Target URL: `https://tugql.org/${2}`
- Status code: 301
- Preserve query string: enabled

Example: `https://www.dtql.org/es/?q=1` redirects to `https://tugql.org/es/?q=1`.

## Files

```
tugql-org/
├── public/            ← static assets served to the browser
│   ├── index.html     ← canonical landing page with schema.org JSON-LD and canonical tag
│   ├── 404.html       ← body served with HTTP 404 for unknown URLs
│   ├── llms.txt       ← plain-text description and key links for agents
│   ├── styles.css
│   ├── robots.txt
│   └── sitemap.xml
└── wrangler.jsonc     ← assets-only Worker config (no `main`)
```

## Preview locally

```sh
npm exec --yes --package=wrangler@4.120.1 -- wrangler dev
```
Serves the `public/` directory at `http://localhost:8787` (assets only; host redirects are zone rules and do not run locally).

## Deploy

[Site build and deploy](.github/workflows/site-deploy.yml) runs `npm test` and validates the assets-only deployment with pinned Wrangler's `deploy --dry-run` on pull requests, pushes to `main`, and manual runs. There are no application dependencies to install. The `tugql-org-deployment` artifact contains a tar archive of all `public/` assets (including hidden files), `wrangler.jsonc`, and source `REVISION`.

Only pushes to `main` and manual runs on `main` enter the `production` environment. The deployment job downloads that run's artifact, verifies its revision, and publishes the archived assets using `wrangler deploy --config wrangler.jsonc`. No asset regeneration runs during publication.

Automatic publication is disabled by default. Set the repository variable `CLOUDFLARE_DEPLOY_ENABLED` to `true` only when credentials and the production environment are ready. Every build still saves the artifact while publication is disabled; the run summary distinguishes the saved artifact from a deployment. An operator can download `site.tar.gz` and `site.tar.gz.sha256`, verify and extract them, and publish the exact packaged output with the pinned Wrangler command below, without rebuilding.

Set `EXPECTED_SOURCE_SHA` to the full `head_sha` from the verified GitHub Actions run that produced the downloaded artifact.

```sh
set -eu
: "${EXPECTED_SOURCE_SHA:?Set to the verified GitHub run head_sha}"
mkdir deployment
shasum -a 256 -c site.tar.gz.sha256
tar -xzf site.tar.gz -C deployment
cd deployment
test "$(cat REVISION)" = "$EXPECTED_SOURCE_SHA"
npm exec --yes --package=wrangler@4.120.1 -- wrangler deploy --config wrangler.jsonc
```

The operator supplies `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through the existing local environment; credentials are not part of the artifact.

Configure `CLOUDFLARE_API_TOKEN` as a secret available to this repository and `CLOUDFLARE_ACCOUNT_ID` as a variable for the existing account. Restrict the `production` environment to `main` and configure any required approvals. The token needs deployment access to the existing `tugql-org` Worker and its configured custom domains. After the first GitHub deployment is verified, retire the legacy Cloudflare Git production build trigger so GitHub Actions owns publication.

## Custom Domains

Configure routes or custom domains in Cloudflare Dashboard or via `wrangler.jsonc`:
- `tugql.org` (custom domain, canonical host)
- `www.tugql.org` (custom domain; zone Redirect Rule 301 to `https://tugql.org`, path and query preserved)
- `dtql.org` (custom domain; zone Redirect Rule 301 to `https://tugql.org`, path and query preserved)
- `www.dtql.org` (custom domain; zone Redirect Rule 301 to `https://tugql.org`, path and query preserved)
