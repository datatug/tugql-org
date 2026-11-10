export const syntax = {
  slug: 'syntax',
  title: 'TugQL syntax cheat sheet',
  description: 'The clause order, projection forms, source qualifiers, parameters and comments used in TugQL text queries.',
  sections: [
    {
      heading: 'A complete read query',
      html: `<pre><code>parameters (
  @MinInvoices integer default 2
)
from Invoice as i
where i.InvoiceId &gt; 1
group by i.CustomerId
having COUNT(*) &gt;= @MinInvoices
order by i.CustomerId asc
select i.CustomerId, COUNT(*) as InvoiceCount</code></pre>
<p>Write <code>FROM</code>, optional <code>WHERE</code>, <code>GROUP BY</code>, <code>HAVING</code>, <code>ORDER BY</code> and <code>LIMIT</code>, then optional <code>SELECT</code>. The <code>parameters</code> block precedes the query. This example comes from the <a href="https://github.com/dal-go/dalgo/tree/main/tugql">Go implementation's authoring reference</a>; execution still depends on the connected database and adapter.</p>`,
    },
    {
      heading: 'Projection and aliases',
      html: `<p>A compact projection separates items with commas. A multiline projection puts one item on each line, without commas. Use <code>as</code> for an output alias or source alias.</p>
<pre><code>from Invoice as i
select (
  i.InvoiceId as ID
  i.CustomerId
)</code></pre>`,
    },
    {
      heading: 'Sources and databases',
      html: `<p>Use a dotted source such as <code>sales.Invoice</code> (a schema path) or a slash path such as <code>spaces/{SpaceID}/ext/datatug/projects</code>. A root <code>databases</code> block declares database aliases; <code>alias::source</code> selects a declared database. The dot and double colon have different meanings.</p>
<pre><code>databases (
  sales
  geo
)
from sales::Invoice as i
join geo::Country as c
  on i.BillingCountry = c.Name
select i.InvoiceId, c.Name</code></pre>
<p>A cross-database join requires an explicit <code>on</code> condition. The caller supplies authorized schemas for resolution and a database resolver for execution. The executing tool must check each source against its database access policy. <a href="https://github.com/tugql/tugql/blob/main/reference/cross-database.md">Read the cross-database reference.</a></p>`,
    },
    {
      heading: 'Comments and saved text',
      html: `<p>TugQL text accepts <code>--</code> and <code>//</code> comments. YAML uses <code>#</code>. A quoted database target is required when it contains <code>//</code>, such as a URL. <a href="https://github.com/tugql/tugql/blob/main/reference/comments.md">Read the comment conversion rules.</a></p>
<pre><code>from Invoice as i -- billing records
where i.InvoiceId &gt; 10
select i.InvoiceId</code></pre>`,
    },
  ],
};
