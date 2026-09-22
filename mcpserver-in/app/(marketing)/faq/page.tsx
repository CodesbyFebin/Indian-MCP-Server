// app/(marketing)/faq/page.tsx
// FAQ page

import { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ | MCPServer.in',
  description: 'Frequently asked questions about MCP servers and MCPServer.in',
};

const faqs = [
  {
    question: 'What is MCP?',
    answer:
      'MCP (Model Context Protocol) is an open protocol for connecting LLM applications to external data sources and tools. It provides a standardized JSON-RPC interface for tools, resources, and prompts.',
  },
  {
    question: 'How do you verify servers?',
    answer:
      'We use a multi-stage verification process: automated testing, spec compliance checks, and manual review. Every claim is recorded as an evidence artifact with a SHA-256 proof hash in our append-only ledger.',
  },
  {
    question: 'What does "verified" mean?',
    answer:
      'Verified servers have passed our automated test suite, spec compliance checks, and manual security review. They have at least 3 evidence artifacts in the ledger.',
  },
  {
    question: 'Is MCPServer.in free to use?',
    answer:
      'Yes, browsing and searching the directory is free. API access is rate-limited for anonymous users, but higher limits are available with authentication.',
  },
  {
    question: 'How do I submit a server?',
    answer:
      'Create an account, fill out the server submission form, and our verification pipeline will automatically test and validate your server. You can view the status in the dashboard.',
  },
  {
    question: 'What regions are supported?',
    answer:
      'All servers are global, but we tag them with region metadata. The India region (asia-south1) indicates servers that comply with Indian data residency requirements.',
  },
  {
    question: 'How does PII redaction work?',
    answer:
      'All API responses and database logs go through our automated PII redaction pipeline. It detects Aadhaar numbers, PAN numbers, phone numbers, emails, and IP addresses, then redacts them before storage.',
  },
  {
    question: 'What compliance standards do you follow?',
    answer:
      'We comply with India DPDP Act 2023 and RBI Cyber Framework. See our compliance pages for details.',
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Everything you need to know about MCP servers and MCPServer.in.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="accordion-single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={i.toString()}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
