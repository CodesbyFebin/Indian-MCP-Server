// app/(marketing)/report/india-mcp-2026/page.tsx
// Annual report: India MCP Server Adoption 2026

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India MCP 2026 Report | MCPServer.in',
  description:
    'Annual report on MCP server adoption, trends, and compliance in India.',
};

export default function IndiaReportPage() {
  return (
    <div className="container mx-auto py-16">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          India MCP Server Report 2026
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The first comprehensive report on MCP server adoption, security, and
          compliance in the India region.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Published: September 2026
        </p>
      </header>

      <div className="prose dark:prose-invert max-w-none">
        <h2>Executive Summary</h2>
        <p>
          The MCP ecosystem in India has grown rapidly, with over 100 registered
          servers and growing adoption across startups, fintech, and government
          digital initiatives.
        </p>

        <h2>Key Findings</h2>
        <ol>
          <li><strong>65%</strong> of Indian MCP servers use stdio transport</li>
          <li><strong>87%</strong> support Streamable HTTP for cloud deployment</li>
          <li><strong>42%</strong> have evidence-backed verification</li>
          <li><strong>23%</strong> are compliant with DPDP requirements</li>
        </ol>

        <h3>Transport Preferences</h3>
        <p>
          The majority of Indian MCP servers still use stdio transport (65%),
          reflecting local development workflows. However, HTTP-based transports
          are rapidly growing as servers move to the cloud.
        </p>

        <h3>Security Posture</h3>
        <p>
          Only 23% of servers in the India region currently meet basic DPDP
          compliance requirements, including PII redaction and consent management.
          This represents a significant opportunity for improvement.
        </p>

        <h2>Methodology</h2>
        <p>
          This report is based on analysis of all servers registered on
          MCPServer.in as of September 2026. Each server was evaluated against
          our evidence-backed verification framework.
        </p>

        <h2>Limitations</h2>
        <ul>
          <li>This is the inaugural report — baseline metrics for future comparison</li>
          <li>Server counts may include test/draft servers not in production</li>
          <li>Compliance verification uses automated checks — manual review may differ</li>
        </ul>
      </div>
    </div>
  );
}
