// components/category-grid.tsx
// Grid of server categories with links

import Link from 'next/link';
import {
  Code,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layout,
  Search,
  Shield,
  Terminal,
  Workflow,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

const categories = [
  { name: 'AI & ML', slug: 'ai-ml', icon: <Database className="h-6 w-6" />, color: 'bg-blue-100' },
  { name: 'Database', slug: 'database', icon: <Database className="h-6 w-6" />, color: 'bg-green-100' },
  { name: 'API Tools', slug: 'api-tools', icon: <Globe className="h-6 w-6" />, color: 'bg-orange-100' },
  { name: 'DevOps', slug: 'devops', icon: <GitBranch className="h-6 w-6" />, color: 'bg-purple-100' },
  { name: 'Security', slug: 'security', icon: <Shield className="h-6 w-6" />, color: 'bg-red-100' },
  { name: 'Documentation', slug: 'documentation', icon: <FileText className="h-6 w-6" />, color: 'bg-yellow-100' },
  { name: 'Search', slug: 'search', icon: <Search className="h-6 w-6" />, color: 'bg-indigo-100' },
  { name: 'Workflow', slug: 'workflow', icon: <Workflow className="h-6 w-6" />, color: 'bg-teal-100' },
  { name: 'Terminal', slug: 'terminal', icon: <Terminal className="h-6 w-6" />, color: 'bg-gray-100' },
  { name: 'Analytics', slug: 'analytics', icon: <BarChart3 className="h-6 w-6" />, color: 'bg-cyan-100' },
  { name: 'Messaging', slug: 'messaging', icon: <MessageSquare className="h-6 w-6" />, color: 'bg-pink-100' },
  { name: 'Content', slug: 'content', icon: <Layout className="h-6 w-6" />, color: 'bg-lime-100' },
];

export function CategoryGrid() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
      <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
        Find MCP servers organized by functionality and use case.
        Each category contains servers with evidence-backed claims.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/servers/category/${category.slug}`}
            className="group flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-lg ${category.color} mb-3 group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <span className="font-medium text-sm">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
