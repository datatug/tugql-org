export const tugqt = {
  slug: 'tugqt',
  title: 'TugQT: a query tree you can diff',
  description: 'Store a TugQL read query as structured YAML, review a changed field in Git, and validate the serialized document.',
  sections: [
    {
      heading: 'The YAML document',
      html: `<p>This Go TugQL serialization selects invoice IDs above 10. Each query part is a YAML node rather than an opaque SQL string.</p>
<pre><code>from:
  name: Invoice
where:
  op: '&gt;'
  left:
    field: InvoiceId
  right:
    value: 10
orderBy:
  - field: InvoiceId
columns:
  - field: InvoiceId</code></pre>
<p>The <code>from</code> node names a source, <code>where</code> contains a comparison tree, and <code>columns</code> is the output projection. The Go library's <code>Deserialize</code> and <code>Serialize</code> APIs accept and emit this document; this exact sample was round-tripped against the current Go source.</p>`,
    },
    {
      heading: 'Review a change in Git',
      html: `<p>Save the document in a file such as <code>queries/invoices.tugql.yaml</code>. Changing the threshold produces a focused diff:</p>
<pre><code> right:
-  value: 10
+  value: 20</code></pre>
<p>Reviewers can see which predicate changed without comparing an encoded query string. Keep connection credentials outside the query document.</p>`,
    },
    {
      heading: 'Validate the serialized form',
      html: `<p>The <a href="https://dalgo.io/tugql/schema.json">published JSON Schema</a> describes the Go library's YAML serialization of the core relational read-only structured query subset. It uses JSON Schema draft 2020-12. YAML can be parsed to JSON-compatible values and validated against that schema before a caller resolves or executes the query.</p>
<p>The SQL-like text parsers also use versioned authoring trees. Those are separate representations; the linked serialization schema does not claim to validate them. See the <a href="https://github.com/dal-go/dalgo/tree/main/tugql">Go implementation</a> and <a href="https://github.com/tugql/tugql">language references</a> for their current contracts.</p>`,
    },
  ],
};
