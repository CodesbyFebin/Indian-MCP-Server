// components/server-count.tsx
// Live server count with Suspense for dynamic island

import { db } from '@/lib/db';
import { servers, evidence } from '@/lib/db/schema';
import { BarChart3, Database, Lock } from 'lucide-react';
import { sql } from 'drizzle-orm';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export async function ServerCount() {
  // Run aggregate queries with proper Drizzle syntax
  const serverCounts = await db
    .select({
      total: sql<number>`count(*)`,
      verified: sql<number>`count(*) filter (where verified = true)`,
    })
    .from(servers);

  const evidenceCount = await db.select({ count: sql<number>`count(*)` }).from(evidence);

  const total = serverCounts[0]?.total ?? 0;
  const verified = serverCounts[0]?.verified ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <StatCard
        icon={<Database className="h-8 w-8 text-primary" />}
        value={total}
        label="Active Servers"
      />
      <StatCard
        icon={<Lock className="h-8 w-8 text-green-500" />}
        value={verified}
        label="Verified"
      />
      <StatCard
        icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
        value={evidenceCount[0]?.count ?? 0}
        label="Evidence Artifacts"
      />
      <StatCard
        icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
        value={12}
        label="Categories"
      />
    </div>
  );
}
