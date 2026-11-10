export const compareMalloy = {
  slug: 'tugql-vs-malloy',
  title: 'TugQL vs Malloy',
  description: 'Compare TugQL queries and TugQT trees with Malloy sources, views and analytical modeling.',
  sections: [
    {
      heading: 'Two read-query examples',
      html: `<p>These examples show each language's shape. They are not a claim that the two queries run against the same source or produce identical results.</p>
<h3>TugQL</h3><pre><code>from Invoice as i
group by i.CustomerId
select i.CustomerId, COUNT(*) as InvoiceCount</code></pre>
<h3>Malloy</h3><pre><code>run: flights -&gt; {
  group_by: carrier
  aggregate: flight_count
}</code></pre>
<p>The Malloy example is from the <a href="https://docs.malloydata.dev/documentation/language/query.html">Malloy query reference</a> and assumes a defined <code>flights</code> source with a <code>flight_count</code> measure. The TugQL form follows the <a href="/docs/syntax/">TugQL syntax reference</a>; its aggregate still needs support in the chosen implementation and adapter.</p>`,
    },
    {
      heading: 'Model and execution path',
      html: `<p>Malloy queries start from a source and transform it through views and stages. Its model can define reusable dimensions, measures and join relationships. Malloy compiles queries to SQL for supported database connections. The <a href="https://docs.malloydata.dev/documentation/language/query.html">query reference</a> and <a href="https://docs.malloydata.dev/documentation/language/source.html">source reference</a> describe those concepts.</p>
<p>TugQL is a SQL-like read-query language with a structured YAML/JSON representation called TugQT. Its Go implementation resolves a query to DALgo's model, then uses an adapter. That includes non-SQL paths such as Git-backed inGitDB, subject to feature and adapter support. TugQT can be reviewed as a query tree in Git; it is not a replacement for Malloy's semantic modeling features.</p>`,
    },
    {
      heading: 'Which one fits?',
      html: `<p>Choose Malloy when the main task is reusable analytical modeling and exploration over its supported SQL connections. Consider TugQL when a caller needs a read-query representation that can target DALgo-backed sources, including a Git-backed source, or wants to save and diff the structured query itself. Verify the specific backend and language feature before relying on portability.</p>
<p>Sources: <a href="https://docs.malloydata.dev/documentation/language/query.html">Malloy query reference</a>; <a href="https://github.com/tugql/tugql">TugQL specification</a>; <a href="https://github.com/dal-go/dalgo/tree/main/tugql">DALgo TugQL implementation</a>.</p>`,
    },
  ],
};
