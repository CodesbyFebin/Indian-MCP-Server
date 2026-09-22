// app/page.tsx
// Root Page — Marketing Hero + Live Stats
// SSG with dynamic islands for live counts

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, BarChart3, Database, Lock } from 'lucide-react';
import { ServerCount } from '@/components/server-count';
import { CategoryGrid } from '@/components/category-grid';
import { Hero } from '@/components/hero';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Hero />

      {/* Live Stats Section */}
      <section className="container mx-auto py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Live Directory Stats</h2>
          <p className="text-muted-foreground max-w2xl mx-auto">
            Real-time counts of verified MCP servers, evidence artifacts, and
            compliance reports in the India-region directory.
          </p>
        </div>

        <Suspense fallback={<ServerCountLoading />}>
          <ServerCount />
        </Suspense>
      </section>

      {/* Categories */}
      <section className="container mx-auto py-16 sm:py-24">
        <CategoryGrid />
      </section>

      {/* CTA */}
      <section className="container mx-auto py-16 sm:py-24">
        <div className="bg-primary text-primary-foreground rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to list your MCP server?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join the India-region MCP directory. Get verified with our
            evidence-backed claims system and reach developers building the
            next generation of AI-powered applications.
          </p>
          <Link
            href="/servers"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
          >
            Browse All Servers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ServerCountLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
