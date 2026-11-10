export const howtoFirestore = {
  slug: 'query-firestore',
  title: 'Query Firestore with TugQL',
  description: 'Write a SQL-like TugQL read for a Firestore collection, then resolve it with an authorized schema and the DALgo Firestore adapter.',
  sections: [
    {
      heading: 'Start with a collection you control',
      html: `<p>Assume an application already has a root Firestore collection named <code>products</code> with a Boolean <code>active</code> field. This is an illustrative schema, not a public dataset or a claim about your Firestore project. The application supplies the authorized collection and fields to TugQL resolution, enforces its own read policy, and provides credentials to its Firestore client. The adapter alone does not establish that policy.</p>`,
    },
    {
      heading: 'Write the TugQL read',
      html: `<pre><code>from products as p
where p.active = true</code></pre>
<p>This is TugQL text, not a SQL statement sent to Firestore. With no <code>select</code> clause, resolution expands the fields authorized for the caller. The Go <a href="https://github.com/dal-go/dalgo/tree/main/tugql">TugQL parser and resolver</a> require an authorized schema before lowering the query to DALgo's structured model. Replace <code>products</code> and <code>active</code> with names from your own schema.</p>`,
    },
    {
      heading: 'Bind the adapter and check capabilities',
      html: `<ol><li>Provide an authorized schema for the collection to <code>ResolveTugQL</code>. The <a href="/docs/getting-started/">Go tutorial</a> shows the parse and resolve calls.</li><li>Create a credentialed Firestore client and pass it to a DALgo database backed by <a href="https://github.com/dal-go/dalgo2firestore">dalgo2firestore</a>. Enforce your application's read policy outside this adapter.</li><li>Execute the resolved read query and handle errors. The adapter maps supported collection, filter, order and paging forms to Firestore queries.</li></ol>
<p>The current <a href="https://github.com/dal-go/dalgo2firestore/blob/main/query.go">Firestore adapter query path</a> explicitly rejects <code>GROUP BY</code> and <code>HAVING</code>. A TugQL construct supported by the language is not automatically supported by this adapter. Consult the adapter source and test your exact query before publishing a runnable example or result. QueryDock's SQL playground does not connect to your Firestore project or execute TugQL.</p>`,
    },
  ],
};
