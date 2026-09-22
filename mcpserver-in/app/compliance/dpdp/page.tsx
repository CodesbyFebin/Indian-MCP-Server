// app/compliance/dpdp/page.tsx
// DPDP (Digital Personal Data Protection Act) compliance page

import { Metadata } from 'next';
import { Shield, CheckCircle, FileText, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DPDP Compliance | MCPServer.in',
  description:
    'How MCPServer.in complies with the Digital Personal Data Protection Act 2023.',
};

export default function DpdpPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">DPDP Compliance</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Our commitment to the Digital Personal Data Protection Act, 2023.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="border rounded-lg p-6">
          <Shield className="h-8 w-8 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-3">Data Collection</h2>
          <p className="text-muted-foreground">
            We collect only the minimum personal data required to provide our
            services. All data collection is opt-in and clearly documented.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-3">PII Redaction</h2>
          <p className="text-muted-foreground">
            All logs, API responses, and evidence artifacts are automatically
            redacted. PII patterns (Aadhaar, PAN, phone, email) are detected
            and masked before storage.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <FileText className="h-8 w-8 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-3">Consent Management</h2>
          <p className="text-muted-foreground">
            Users can manage their consent preferences in the dashboard. We
            provide granular controls for data collection and processing.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <BarChart3 className="h-8 w-8 text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold mb-3">Audit Trail</h2>
          <p className="text-muted-foreground">
            All data access is logged with an immutable audit trail. Audit logs
            are append-only and retained per regulatory requirements.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg p-8 border">
        <h2 className="text-2xl font-bold mb-4">Compliance Checklist</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>PII redaction pipeline active on all logs and API responses</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Data processed only in India region (asia-south1)</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Consent management dashboard available for authenticated users</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Right to erasure honored within 30 days</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Data breach notification process defined (72-hour window)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
