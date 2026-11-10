export const specSourcePaths = [
  'docs/spec/README.md',
  'docs/spec/reference/cross-database.md',
  'docs/spec/reference/aggregation.md',
  'docs/spec/reference/negative-projection.md',
  'docs/spec/reference/comments.md',
];

export const spec = {
  slug: 'spec',
  title: 'TugQL specification and schema',
  description: 'Read the current TugQL reference snapshot on this domain and download the Go serialization JSON Schema.',
  sections: [
    {
      heading: 'Specification source',
      html: `<p>This page hosts a snapshot of the public <a href="https://github.com/tugql/tugql/tree/ff06f6a3318b5da2735835c9b4045b536f579759">tugql/tugql</a> material at commit <code>ff06f6a</code> under its <a href="/docs/spec/LICENSE.txt">Apache 2.0 license</a>. Check the source repository for later changes.</p>
<ul>
<li><a href="/docs/spec/README.md">TugQL overview and naming</a></li>
<li><a href="/docs/spec/reference/cross-database.md">Cross-database query reference</a></li>
<li><a href="/docs/spec/reference/aggregation.md">Aggregation reference</a></li>
<li><a href="/docs/spec/reference/negative-projection.md">Negative projection reference</a></li>
<li><a href="/docs/spec/reference/comments.md">Comment syntax and conversion</a></li>
</ul>
<p>The source files above are served as Markdown. The overview's links to design material outside this snapshot point back to the pinned GitHub commit. The <a href="/docs/syntax/">syntax cheat sheet</a> and <a href="/docs/cross-database/">worked tutorial</a> are HTML guides to selected parts of those references.</p>`,
    },
    {
      heading: 'JSON Schema download',
      html: `<p><a href="/docs/schema.json">Download schema.json</a> (<a href="/docs/schema-LICENSE.txt">MIT license notice</a>). This is an exact copy of <a href="https://github.com/dal-go/dalgo/blob/69da201f70997e3ee37c9685abb7f6d727eaa3e7/tugql/schema/schema.json">DALgo's schema</a> at commit <code>69da201</code>. It describes the Go library's YAML serialization of the core relational read-only <code>dal.StructuredQuery</code> subset and declares JSON Schema draft 2020-12.</p>
<p>It does not validate every text parser authoring tree or prove that every backend executes every construct. Resolve a query against caller-authorized schemas and verify the target adapter's capabilities before execution.</p>`,
    },
  ],
};
