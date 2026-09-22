// app/(app)/deploy/page.tsx
// Deployment creation page

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Server, Copy, Check, Save } from 'lucide-react';

export default async function DeployPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Deploy MCP Server</h1>
          <p className="text-muted-foreground">
            Register your MCP server with the India directory
          </p>
        </div>
      </div>

      <DeployForm organizationId={authContext.organizationId} />
    </div>
  );
}

function DeployForm({ organizationId }: { organizationId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      transport: formData.get('transport') as string,
      repoUrl: formData.get('repoUrl') as string,
      packageUrl: formData.get('packageUrl') as string | undefined,
      versionPin: formData.get('version') as string,
      serverJson: {},
      tools: [],
    };

    try {
      const res = await fetch('/api/v1/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setCopied(data.data.slug);
        alert('Deployment created successfully!');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to create deployment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Server Name *</label>
        <input
          name="name"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Slug (unique identifier) *</label>
        <input
          name="slug"
          required
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and dashes only"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select
          name="category"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a category</option>
          <option value="ai-ml">AI & ML</option>
          <option value="database">Database</option>
          <option value="api-tools">API Tools</option>
          <option value="devops">DevOps</option>
          <option value="security">Security</option>
          <option value="documentation">Documentation</option>
          <option value="search">Search</option>
          <option value="workflow">Workflow</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Transport *</label>
        <select
          name="transport"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="stdio">Stdio</option>
          <option value="streamable_http">Streamable HTTP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Repository URL *</label>
        <input
          name="repoUrl"
          type="url"
          required
          placeholder="https://github.com/user/repo"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Package URL (npm)</label>
        <input
          name="packageUrl"
          type="url"
          placeholder="https://npmjs.com/package/your-package"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Version Pin</label>
        <input
          name="version"
          placeholder="1.0.0"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Submitting...' : 'Create Deployment'}
        <Save className="h-4 w-4" />
      </button>

      {copied && (
        <div className="text-center text-sm text-green-600">
          ✓ Server slug "{copied}" registered successfully
        </div>
      )}
    </form>
  );
}
