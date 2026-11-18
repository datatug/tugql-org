import { HERO_QUERY, highlightTugQL, tryInDataTugUrl } from '../hero.mjs';

export const crossDatabase = {
  slug: 'cross-database',
  title: 'Join Chinook and geo-ingitdb with TugQL',
  description: 'Walk through one TugQL read query that joins Chinook invoices to country aliases and population data in a Git-backed database.',
  sections: [
    {
      heading: 'The query',
      html: `<p>This is the same source shown on the <a href="/#example">homepage</a>. It names the two data sources explicitly and projects country, total and population.</p>
<pre><code>${highlightTugQL(HERO_QUERY)}</code></pre>
<p><a href="${tryInDataTugUrl(HERO_QUERY)}">Open this exact query in DataTug</a>. The link carries the text in the URL fragment. Execution depends on DataTug's current access to both data sources; this page does not claim a fixed result set.</p>`,
    },
    {
      heading: 'Read it in four steps',
      html: `<ol>
<li><code>databases</code> declares <code>chinook</code> and <code>geo</code>. The target strings identify the two sources; connection credentials stay outside the query.</li>
<li><code>from chinook::Invoice</code> reads invoices. <code>join geo::country_aliases</code> matches the billing country to an alias, then <code>join geo::population_wb</code> adds population by canonical country.</li>
<li><code>group by</code> prepares the aggregate. <code>SUM(i.Total)</code> computes the total for each group; <code>order by Total desc</code> requests a result order.</li>
<li><code>select</code> names the three returned columns. Projection is the final text clause in TugQL.</li>
</ol>
<p>For a cross-database join, <code>on</code> is explicit because relationship metadata cannot be inferred across separate databases. The executing tool must check each source against that database's access policy.</p>`,
    },
    {
      heading: 'What executes where',
      html: `<p>The <a href="https://github.com/tugql/tugql/blob/main/reference/cross-database.md">cross-database reference</a> defines aliases, qualified sources and failure modes. The executing tool binds aliases to databases. Each source is read from its own database; the federated engine performs joins and grouping across them. A backend does not receive this entire text as native SQL.</p>
<p><a href="https://github.com/ingitdb/geo-ingitdb">Inspect the geo-ingitdb source repository</a> and the <a href="https://github.com/dal-go/dalgo/tree/main/tugql">Go implementation</a> for the current execution contract.</p>`,
    },
  ],
};
