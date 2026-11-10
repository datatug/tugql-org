export const comparePrql = {
  slug: 'tugql-vs-prql',
  title: 'TugQL vs PRQL',
  description: 'Compare a TugQL read query with a PRQL pipeline and choose by execution path and query representation.',
  sections: [
    {
      heading: 'The same small projection',
      html: `<p>These examples express a projection over an <code>employees</code> source. The source must exist in the connected database; the examples do not assert a shared execution result.</p>
<h3>TugQL</h3><pre><code>from employees
select id, first_name, age</code></pre>
<h3>PRQL</h3><pre><code>from employees
select {id, first_name, age}</code></pre>
<p>The PRQL form follows the <a href="https://prql-lang.org/">official PRQL example</a>. The TugQL form follows its <a href="/docs/syntax/">text syntax</a>. Both are read-oriented in this comparison, but they take different paths after parsing.</p>`,
    },
    {
      heading: 'Execution and representation',
      html: `<p><a href="https://prql-lang.org/">PRQL compiles to SQL</a> for supported dialects. A SQL database executes the generated SQL. TugQL has a SQL-like text form and a structured TugQT form; its Go implementation resolves a query to DALgo's query model for an adapter to execute. That path can address non-SQL data such as a Git-backed inGitDB source, subject to adapter support and access policy. TugQL text is not SQL sent directly to a database.</p>
<p>PRQL also has its own compiler representation and tooling. A saved, reviewable YAML or JSON query tree is a specific TugQT use case, not a claim that PRQL has no structured representation. See the <a href="/docs/tugqt/">TugQT example</a>.</p>`,
    },
    {
      heading: 'Which one fits?',
      html: `<p>Choose PRQL when your target is a supported SQL dialect and you want its pipeline syntax and SQL output. Consider TugQL when a caller needs a portable read-query model across DALgo-backed sources, or when the query tree itself must be saved and diffed. Check the exact language feature and adapter before treating a TugQL query as portable to a new backend.</p>
<p>Sources: <a href="https://prql-lang.org/">PRQL language overview and examples</a>; <a href="https://github.com/tugql/tugql">TugQL specification</a>; <a href="https://github.com/dal-go/dalgo/tree/main/tugql">DALgo TugQL implementation</a>.</p>`,
    },
  ],
};
