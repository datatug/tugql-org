export const faq = {
  slug: 'faq',
  title: 'TugQL FAQ',
  description: 'Answers about the DTQL rename, TugQT, SQL-like syntax, backend support, schemas and where to try a query.',
  sections: [
    {
      heading: 'Why did DTQL become TugQL?',
      html: `<p>DTQL is the former name. <strong>TugQL</strong> is the canonical name of the SQL-like query language, and TugQT names its structured query tree. The <a href="https://github.com/tugql/tugql">specification repository</a> records the rename. On 10 November 2026, <code>http://dtql.org/</code> returned a 301 to <code>https://tugql.org/</code>.</p>`,
    },
    {
      heading: 'Is TugQL SQL?',
      html: `<p>TugQL has an SQL-like text form, but it is not a PostgreSQL or SQLite dialect and is not raw SQL sent to a database. Its structured form can be resolved to a DALgo query. A feature must be supported by the chosen implementation and backend; unsupported constructs should fail explicitly. See the <a href="/docs/syntax/">syntax cheat sheet</a>.</p>`,
    },
    {
      heading: 'What is TugQT?',
      html: `<p>TugQT is the structured YAML/JSON query tree associated with TugQL. It can be saved, reviewed and diffed as data. The Go library also publishes a JSON Schema for its YAML serialization of the core relational read-only subset. That schema is distinct from the versioned trees used by text authoring parsers. See the <a href="/docs/tugqt/">TugQT guide</a> and <a href="/docs/spec/">specification snapshot</a>.</p>`,
    },
    {
      heading: 'Does the same query work on every backend?',
      html: `<p>Portability is a goal of the language, but backend capabilities and adapter coverage vary. DALgo has paths for Git-backed, SQLite, PostgreSQL and Firestore data; a query that runs with one adapter is not proof that every adapter accepts it. Check the relevant <a href="https://dalgo.io/adapters/">adapter capabilities</a> and test the exact query on each target.</p>`,
    },
    {
      heading: 'Can a query read more than one database?',
      html: `<p>Yes, when the executing tool supplies the database bindings and federated execution path. Declare database aliases, qualify sources with <code>alias::</code>, and state cross-database join conditions explicitly. The tool must check every source against its database access policy. See the <a href="/docs/cross-database/">Chinook and geo-ingitdb example</a>.</p>`,
    },
    {
      heading: 'Where can I try an example?',
      html: `<p>The <a href="/docs/cross-database/">connected example</a> opens its exact TugQL text in DataTug. <a href="https://querydock.run/">QueryDock</a> is a separate SQL playground for PostgreSQL-compatible PGlite, SQLite and DuckDB; its present SQL editors should not be treated as TugQL execution.</p>`,
    },
  ],
};
