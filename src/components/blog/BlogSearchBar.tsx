import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
}

export function BlogSearchBar({ query, onQueryChange, resultCount }: Props) {
  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#0C2D48]/40 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search 101 statutory guides, tax laws, visas..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#0C2D48]/12 bg-white text-xs text-[#0C2D48] placeholder:text-[#0C2D48]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-3 p-1 rounded-full text-[#0C2D48]/40 hover:text-[#0C2D48] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {query && (
        <div className="absolute -bottom-5 left-1 text-[10px] font-mono text-[#0C2D48]/50">
          Found {resultCount} matching publication{resultCount === 1 ? '' : 's'}
        </div>
      )}
    </div>
  );
}
