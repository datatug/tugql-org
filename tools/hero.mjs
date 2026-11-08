import { gzipSync } from 'node:zlib';

// The hero sample is one source of truth: it is highlighted for the page and
// sent, byte for byte, to DataTug.app by the "Try in DataTug.app" button. The
// two targets are public read-only demo databases DataTug.app knows how to open.
export const HERO_QUERY = `-- one query, two databases
databases (
  chinook = 'https://cloud.openvaultdb.com/v1/databases/chinook'
  geo     = 'https://github.com/ingitdb/geo-ingitdb'
)
from chinook::Invoice as i
join geo::country_aliases as a
  on i.BillingCountry = a.alias
join geo::population_wb as p
  on a.country = p.country
group by i.BillingCountry, p.population
order by Total desc
select (
  i.BillingCountry as Country
  SUM(i.Total) as Total
  p.population as Population
)`;

// DataTug.app's /try route reads the query from the URL fragment (never a query
// string, so it does not reach any server log): unpadded base64url of gzip(UTF-8).
// Node's gzip writes mtime 0, so the link is identical on every build.
export function tryInDataTugUrl(query) {
  return `https://datatug.app/try#tugql=${gzipSync(Buffer.from(query, 'utf8')).toString('base64url')}`;
}

const TUGQL_KEYWORDS = new Set(['databases', 'with', 'as', 'from', 'where', 'join', 'on', 'group', 'by', 'having', 'order', 'select', 'asc', 'desc', 'and', 'or', 'not']);

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// A small highlighter for the hero sample: comments, single-quoted strings,
// numbers and keywords. Everything else is escaped as-is.
export function highlightTugQL(query) {
  const token = /(--[^\n]*)|('(?:[^']|'')*')|\b(\d+(?:\.\d+)?)\b|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;
  let html = '';
  for (const m of query.matchAll(token)) {
    const [text, comment, string, number, word] = m;
    if (comment) html += `<span class="pl-c">${escapeHtml(comment)}</span>`;
    else if (string) html += `<span class="pl-s">${escapeHtml(string)}</span>`;
    else if (number) html += `<span class="pl-c1">${number}</span>`;
    else if (word && TUGQL_KEYWORDS.has(word.toLowerCase())) html += `<span class="pl-k">${word}</span>`;
    else html += escapeHtml(text);
  }
  return html;
}
