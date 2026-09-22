import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MCPserver.in — Public Authority for MCP Discovery",
  description: "Search MCP servers with evidence-backed verification. AI-indexed registry. SEO/AEO/GEO optimized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl font-bold">MCPserver.in</h1>
              <p className="text-muted-foreground">Public authority for MCP server discovery</p>
            </div>
          </header>
          <main className="container mx-auto py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}