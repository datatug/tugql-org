import { HERO_QUERY, highlightTugQL, tryInDataTugUrl } from '../hero.mjs';

export const examples = {
  slug: 'examples',
  title: 'TugQL examples',
  description: 'Read complete TugQL examples for a Git-backed source and a cross-database join, with their execution boundaries stated.',
  sections: [
    {
      heading: 'Join Chinook with geo-ingitdb',
      html: `<pre><code>${highlightTugQL(HERO_QUERY)}</code></pre>
<p><a href="${tryInDataTugUrl(HERO_QUERY)}">Open this exact TugQL text in DataTug</a>. The link puts the text in a URL fragment; execution depends on access to both sources. The <a href="/docs/cross-database/">tutorial</a> explains each clause and the federated execution path.</p>`,
    },
    {
      heading: 'Read country aliases from a Git-backed source',
      html: `<pre><code>databases (
  geo = 'https://github.com/ingitdb/geo-ingitdb'
)
from geo::country_aliases as a
where a.country = 'ie'
select a.alias, a.country</code></pre>
<p>The <a href="/docs/query-git-ingitdb/">Git-backed how-to</a> shows the source record, adapter and policy requirements. The query text alone does not mount or authorize the repository.</p>`,
    },
    {
      heading: 'Where to run them',
      html: `<p>These are TugQL queries. <a href="https://querydock.run/">QueryDock</a> currently runs SQL with PGlite, SQLite and DuckDB, so a QueryDock run link for these examples would not execute them. For text syntax, see the <a href="/docs/syntax/">cheat sheet</a>; for the structured YAML form, see <a href="/docs/tugqt/">TugQT</a>.</p>`,
    },
  ],
};
