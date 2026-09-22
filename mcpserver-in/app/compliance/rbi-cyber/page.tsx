// app/compliance/rbi-cyber/page.tsx
// RBI Cybersecurity Framework compliance page

import { Metadata } from 'next';
import { Shield, CheckCircle, FileText, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RBI Cyber Framework | MCPServer.in',
  description:
    'How MCPServer.in complies with the Reserve Bank of India Cybersecurity Framework.',
};

const controls = [
  {
    id: 'RBI-001',
    name: 'Access Control',
    description: 'Implement and maintain appropriate access controls for information systems',
    status: 'implemented',
    evidence: 'JWT bearer token auth with scope-based authorization',
  },
  {
    id: 'RBI-002',
    name: 'Cryptographic Controls',
    description: 'Use cryptographic controls to protect confidentiality, integrity, and authenticity',
    status: 'implemented',
    evidence: 'TLS 1.3 enforcement, SHA-256 proof hashes for evidence',
  },
  {
    id: 'RBI-003',
    name: 'Audit Trail',
    description: 'Maintain audit trails for all privileged activities and security-relevant events',
    status: 'implemented',
    evidence: 'Append-only audit_log table with PII redaction',
  },
  {
    id: 'RBI-004',
    name: 'Incident Response',
    description: 'Establish and maintain an incident response capability',
    status: 'partial',
    evidence: 'Error logging and monitoring infrastructure in place',
  },
];

export default function RbiCyberPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">RBI Cybersecurity Framework</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Our compliance with the Reserve Bank of India Cybersecurity Framework
          and associated controls.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/25">
              <th className="text-left p-4">Control ID</th>
              <th className="text-left p-4">Control Name</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.id} className="border-t">
                <td className="p-4 font-mono text-sm">{control.id}</td>
                <td className="p-4 font-semibold">{control.name}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {control.description}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      control.status === 'implemented'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {control.status}
                  </span>
                </td>
                <td className="p-4 text-sm">{control.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 bg-card rounded-lg p-8 border">
        <h2 className="text-2xl font-bold mb-4">Compliance Controls</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>MFA required for all administrative access (ES256 JWT)</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Session timeout enforced (1 hour for JWT, 15 min idle)</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Immutable audit trails with PII redaction</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Vulnerability scanning integrated into CI/CD pipeline</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <span>Data residency enforced (asia-south1 only for IN tenants)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
