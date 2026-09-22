export default function Home() {
  return (
    <main>
      <h1>MCPserver.in</h1>
      <p>Public authority for MCP server discovery</p>
      <nav>
        <a href="/servers">Server Directory</a>
        <a href="/servers/[slug]">Server Details</a>
        <a href="/integrations">Integrations</a>
        <a href="/learn">Learn</a>
      </nav>
    </main>
  );
}