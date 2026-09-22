// components/hero.tsx
// Hero section for the homepage

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          India&apos;s MCP Server Directory
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Discover verified MCP (Model Context Protocol) servers with
          evidence-backed capability claims. Built for the India region —
          DPDP compliant, RBI pre-flight checked, and always on.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/servers"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Browse All Servers
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/protocol"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-secondary/80 transition"
          >
            How It Works
            <Play className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            2026-07-28 MCP Spec
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            India Region (asia-south1)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Evidence-Ledger Backed
          </span>
        </div>
      </div>
    </section>
  );
}
