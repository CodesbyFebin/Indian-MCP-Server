// components/servers-filters.tsx
// Filter controls for the server directory

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import { useCallback, useState } from 'react';

const categories = [
  'AI & ML',
  'Database',
  'API Tools',
  'DevOps',
  'Security',
  'Documentation',
  'Search',
  'Workflow',
  'Terminal',
  'Analytics',
  'Messaging',
  'Content',
];

export function ServerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [showCategory, setShowCategory] = useState(false);

  const updateURL = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }

      router.push(`${pathname}?${newParams.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: search || null });
  };

  const handleCategory = (category: string) => {
    const current = searchParams.get('category');
    updateURL({ category: current === category ? null : category });
    setShowCategory(false);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('search');

  const hasFilters = currentCategory || currentSearch;

  return (
    <div className="mb-6 space-y-4">
      {/* Search + Clear */}
      <div className="flex gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            type="search"
            placeholder="Search servers..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
        </form>

        <div className="relative">
          <button
            onClick={() => setShowCategory(!showCategory)}
            className="px-4 py-2 rounded-lg border bg-background hover:bg-muted/50 flex items-center gap-2"
          >
            Category
            <ChevronDown className="h-4 w-4" />
          </button>

          {showCategory && (
            <div className="absolute top-full mt-2 w-48 bg-popover border rounded-lg shadow-lg z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                    currentCategory === cat ? 'bg-secondary/20 font-medium' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="p-2 rounded-lg border bg-background hover:bg-muted/50"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {currentCategory && (
            <span className="text-xs px-3 py-1 bg-secondary/10 rounded-full">
              Category: {currentCategory}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
