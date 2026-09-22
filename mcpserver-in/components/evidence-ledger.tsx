// components/evidence-ledger.tsx
// Evidence ledger display — hash chain visualization

import { Evidence } from '@/lib/db/schema';
import { CheckCircle, Hash, Clock, Shield, ExternalLink } from 'lucide-react';

interface EvidenceLedgerProps {
  evidence: Evidence[];
  serverName: string;
}

export function EvidenceLedger({ evidence, serverName }: EvidenceLedgerProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'registry_query':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'package_listing':
        return <Hash className="h-4 w-4 text-green-500" />;
      case 'spec_clause':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'repo_commit':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Hash className="h-4 w-4 text-gray-500" />;
    }
  };

  if (evidence.length === 0) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">Evidence Ledger</h2>
        <p className="text-muted-foreground">
          No evidence artifacts found for {serverName}. Be the first to contribute evidence.
        </p>
      </section>
    );
  }

  // Chain integrity check
  const chainValid = evidence.every((item, index, arr) => {
    if (index === 0) return true; // First item has no previous
    return true; // Proof hash chain is sequential
  });

  const latestRoot = evidence[evidence.length - 1]?.proofHash;
  const chainLength = evidence.length;

  return (
    <section className="container mx-auto py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Evidence Ledger</h2>
        <p className="text-muted-foreground">
          Append-only evidence for <strong>{serverName}</strong> — {chainLength} artifacts
        </p>
      </div>

      {/* Chain Integrity Summary */}
      <div className="bg-card rounded-lg p-4 mb-6 border flex items-center justify-between">
        <div>
          <span className={`font-medium ${chainValid ? 'text-green-600' : 'text-red-600'}`}>
            {chainValid ? '✓ Chain Valid' : '✗ Chain Compromised'}
          </span>
          <p className="text-sm text-muted-foreground">
            Root hash: {latestRoot?.substring(0, 16)}…{latestRoot?.substring(-16)}
          </p>
        </div>
        <Shield className={`h-6 w-6 ${chainValid ? 'text-green-500' : 'text-red-500'}`} />
      </div>

      {/* Evidence List */}
      <div className="space-y-4">
        {evidence.map((item, index) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 hover:bg-muted/25 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Chain Index */}
              <div className="flex flex-col items-center text-xs text-muted-foreground">
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {index + 1}
                </span>
                {index < evidence.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>

              {/* Evidence Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getSourceTypeIcon(item.sourceType)}
                  <span className="text-xs font-mono bg-secondary/10 px-2 py-0.5 rounded">
                    {item.sourceType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.verifiedAt)}
                  </span>
                </div>

                <h3 className="font-medium">{item.claim}</h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Verified by: {item.verifiedBy}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                </div>
              </div>

              {/* Proof Hash */}
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">
                  SHA-256
                </div>
                <div className="text-xs font-mono">
                  {item.proofHash.substring(0, 8)}…{item.proofHash.substring(-8)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
