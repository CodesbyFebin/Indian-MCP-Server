// app/(marketing)/pricing/page.tsx
// Pricing page

import { Metadata } from 'next';
import { CheckCircle, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | MCPServer.in',
  description: 'Pricing plans for MCP server hosting and directory features.',
};

const plans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Browse the public directory. All core features.',
    features: [
      { name: 'Public server directory', included: true },
      { name: 'Evidence-backed verification', included: true },
      { name: 'MCP endpoint access', included: true },
      { name: 'Community support', included: true },
      { name: 'Custom domain hosting', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹2,999/mo',
    description: 'For teams running production MCP servers.',
    features: [
      { name: 'Public server directory', included: true },
      { name: 'Evidence-backed verification', included: true },
      { name: 'MCP endpoint access', included: true },
      { name: 'Community support', included: true },
      { name: 'Custom domain hosting', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with advanced requirements.',
    features: [
      { name: 'Public server directory', included: true },
      { name: 'Evidence-backed verification', included: true },
      { name: 'MCP endpoint access', included: true },
      { name: 'Community support', included: false },
      { name: 'Custom domain hosting', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pay only for what you use. All plans include our core directory and
          evidence-backed verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-lg p-8 ${
              plan.popular ? 'border-primary shadow-lg' : ''
            }`}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <div className="text-3xl font-bold my-3">{plan.price}</div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li
                  key={feature.name}
                  className="flex items-center gap-3 text-sm"
                >
                  {feature.included ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300" />
                  )}
                  <span
                    className={
                      feature.included ? '' : 'text-muted-foreground line-through'
                    }
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2 px-4 rounded-lg font-semibold ${
                plan.popular
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
