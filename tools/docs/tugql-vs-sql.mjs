export const compareSql = {
  slug: 'tugql-vs-sql',
  title: 'TugQL vs SQL',
  description: 'See the clause order and execution difference between a TugQL read query and a SQL SELECT statement.',
  sections: [
    {
      heading: 'A filtered read',
      html: `<p>Both examples describe a filtered projection from a table named <code>Invoice</code>. They are illustrative syntax; actual results depend on the data and executor.</p>
<h3>TugQL</h3><pre><code>from Invoice as i
where i.InvoiceId &gt; 1
order by i.InvoiceId asc
select i.InvoiceId, i.CustomerId</code></pre>
<h3>SQL</h3><pre><code>SELECT i.InvoiceId, i.CustomerId
FROM Invoice AS i
WHERE i.InvoiceId &gt; 1
ORDER BY i.InvoiceId ASC;</code></pre>
<p>TugQL places <code>select</code> after the source and modifiers; SQL places <code>SELECT</code> first. Compare the <a href="/docs/syntax/">TugQL syntax sheet</a> with the <a href="https://www.postgresql.org/docs/current/sql-select.html">PostgreSQL SELECT reference</a>.</p>`,
    },
    {
      heading: 'What the executor receives',
      html: `<p>A SQL database executes SQL in its dialect. TugQL text is parsed into a structured query and resolved for a DALgo-backed executor; it is not passed as raw SQL to PostgreSQL, SQLite or another backend. The structured TugQT form can be serialized to YAML or JSON for review and reuse. The <a href="/docs/tugqt/">TugQT guide</a> shows a saved tree.</p>
<p>SQL dialect features vary. TugQL also has its own syntax and implementation limits, and each DALgo adapter has different capabilities. Do not assume that a SQL statement can be pasted into TugQL, or that a TugQL construct executes on every adapter.</p>`,
    },
    {
      heading: 'Which one fits?',
      html: `<p>Use SQL when you are working directly with a SQL engine and need its dialect and database features. Consider TugQL when a tool needs a read-query model that can be bound to supported SQL or non-SQL DALgo sources, or a reviewable query tree. Verify the exact query and adapter before relying on cross-backend execution.</p>
<p>Sources: <a href="https://www.postgresql.org/docs/current/sql-select.html">PostgreSQL SELECT documentation</a>; <a href="https://github.com/tugql/tugql">TugQL specification</a>; <a href="https://github.com/dal-go/dalgo/tree/main/tugql">DALgo implementation</a>.</p>`,
    },
  ],
};
