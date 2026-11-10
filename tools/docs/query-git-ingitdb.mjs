export const howtoGit = {
  slug: 'query-git-ingitdb',
  title: 'Query a Git-backed inGitDB repository with TugQL',
  description: 'Read the geo-ingitdb country aliases as a TugQL source and see what a Git-backed adapter must provide.',
  sections: [
    {
      heading: 'Inspect the source first',
      html: `<p>The public <a href="https://github.com/ingitdb/geo-ingitdb">geo-ingitdb repository</a> stores records and collection definitions in Git. Its <a href="https://github.com/ingitdb/geo-ingitdb/tree/main/country_aliases">country_aliases collection</a> has <code>alias</code> and <code>country</code> fields. For example, the committed <a href="https://github.com/ingitdb/geo-ingitdb/blob/main/country_aliases/%24records/ireland.json">Ireland record</a> maps the alias to <code>ie</code>. A Git repository by itself is not a SQL server; an inGitDB/DALgo adapter must open the data.</p>`,
    },
    {
      heading: 'Write the read query',
      html: `<pre><code>databases (
  geo = 'https://github.com/ingitdb/geo-ingitdb'
)
from geo::country_aliases as a
where a.country = 'ie'
select a.alias, a.country</code></pre>
<p>The <code>databases</code> block declares the <code>geo</code> target; <code>geo::country_aliases</code> selects a source from that binding. The target string identifies the repository, but it does not authenticate or mount it. The executing tool resolves that target, supplies an authorized schema, and checks database access policy before reading. See the <a href="/docs/syntax/">syntax sheet</a> and <a href="https://github.com/tugql/tugql/blob/main/reference/cross-database.md">source qualifier reference</a>.</p>`,
    },
    {
      heading: 'Bind and execute',
      html: `<ol><li>Open the repository with an inGitDB adapter, such as the <a href="https://github.com/ingitdb/dalgo2ingitdb">local Git working-tree DALgo adapter</a>. Its configuration and owner policies apply to reads.</li><li>Parse TugQL text and resolve it against the caller-authorized <code>country_aliases</code> schema. The <a href="/docs/getting-started/">Go tutorial</a> shows the parse/resolve API.</li><li>Pass the resolved query to the database binding and execute it under that adapter's read session. Check the returned error and data rather than assuming that every TugQL feature is supported.</li></ol>
<p>For an example that joins this Git-backed database with Chinook, see the <a href="/docs/cross-database/">cross-database tutorial</a>. QueryDock's current SQL engines do not execute this TugQL query.</p>`,
    },
  ],
};
