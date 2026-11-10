import { HERO_QUERY, tryInDataTugUrl } from '../hero.mjs';

export const gettingStarted = {
  slug: 'getting-started',
  title: 'Get started with TugQL',
  description: 'Read a TugQL query, learn its source, filter, order and projection stages, and find the Go and TypeScript implementations.',
  sections: [
    {
      heading: 'Read a query',
      html: `<p>This query reads invoices, keeps IDs above 10, orders by ID, and returns one field. <code>Invoice</code> is a source name; the application must bind it to a database.</p>
<pre><code>from Invoice as i
where i.InvoiceId &gt; 10
order by i.InvoiceId
select i.InvoiceId</code></pre>
<p>TugQL puts the projection at the end, after the source and filters. It is SQL-like text, not SQL sent directly to PostgreSQL or Firestore.</p>`,
    },
    {
      heading: 'Parse and resolve in Go',
      html: `<p>Install the <a href="https://github.com/dal-go/dalgo/tree/main/tugql">Go library</a>, then provide the fields this caller is allowed to query. Parsing checks syntax; resolution checks names and permissions against the supplied schema and lowers the query to a DALgo structured query. This example resolves one output column; it does not connect to a database.</p>
<pre><code>go get github.com/dal-go/dalgo/tugql</code></pre>
<pre><code>package main

import (
  "fmt"
  "github.com/dal-go/dalgo/tugql"
)

func main() {
  source := "from Invoice as i\\nwhere i.InvoiceId &gt; 10\\norder by i.InvoiceId\\nselect i.InvoiceId"
  doc, diagnostics := tugql.ParseTugQL(source)
  if len(diagnostics) != 0 {
    fmt.Println(diagnostics)
    return
  }
  context := tugql.TugQLResolveContext{
    AuthorizedSchemas: []tugql.TugQLAuthorizedSchema{{
      Version: "schema-r1",
      Tables: []tugql.TugQLTable{{
        Name: "Invoice",
        Fields: []tugql.TugQLField{{Name: "InvoiceId", Type: "integer", Authorized: true}},
      }},
    }},
  }
  resolved, diagnostics := tugql.ResolveTugQL(doc, context)
  if len(diagnostics) != 0 {
    fmt.Println(diagnostics)
    return
  }
  fmt.Printf("resolved %d output column(s)\\n", len(resolved.Columns))
}</code></pre>
<p>Expected output: <code>resolved 1 output column(s)</code>. The <a href="https://github.com/dal-go/dalgo-js">TypeScript core</a> has separate parsing and resolution APIs; check its README and adapter inventory for supported execution paths.</p>`,
    },
    {
      heading: 'Try the connected example',
      html: `<p>The <a href="/#example">homepage example</a> declares Chinook and <code>geo-ingitdb</code>, joins their sources, and opens in the DataTug browser. It is a separate executable example with two demo references. The executing tool still applies its own access rules.</p>
<p><a href="${tryInDataTugUrl(HERO_QUERY)}">Try the connected query in DataTug</a></p>
<p><a href="https://github.com/tugql/tugql/blob/main/reference/cross-database.md">Read the cross-database reference</a> for the <code>databases</code> block and <code>alias::</code> source syntax.</p>`,
    },
    {
      heading: 'Save the query as data',
      html: `<p>TugQT is the structured YAML/JSON tree of a TugQL query, useful for reviewable saved queries. The <a href="https://dalgo.io/tugql/schema.json">published JSON Schema</a> validates the Go library's YAML serialization of a structured query. The versioned text parser tree is a separate representation. The <a href="https://github.com/tugql/tugql">specification repository</a> contains current references; the implementation repositories contain executable behavior and tests.</p>`,
    },
  ],
};
