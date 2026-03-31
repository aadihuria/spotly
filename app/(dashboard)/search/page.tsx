'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { SpotFilters } from '@/components/spots/SpotFilters';
import { SpotGrid } from '@/components/spots/SpotGrid';
import { useStudySpots } from '@/hooks/useStudySpots';
import { ANN_ARBOR_SPOTS } from '@/data/spots';
import type { Spot } from '@/types';

export default function SearchPage() {
  const { spots, isLoading } = useStudySpots();
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const source: Spot[] = spots.length > 0 ? spots : ANN_ARBOR_SPOTS;

  const results = useMemo(() => {
    return source.filter((spot: Spot) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        spot.name.toLowerCase().includes(q) ||
        (spot.address || '').toLowerCase().includes(q) ||
        (spot.location || '').toLowerCase().includes(q) ||
        spot.tags.some((tag: string) => tag.toLowerCase().includes(q));

      const normalized = selectedFilter.toLowerCase();
      const matchesFilter =
        selectedFilter === 'All' ||
        spot.tags.some((tag: string) => tag.toLowerCase().includes(normalized)) ||
        spot.name.toLowerCase().includes(normalized);

      return matchesQuery && matchesFilter;
    });
  }, [query, selectedFilter, source]);

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="rounded-2xl bg-[#F3F4F6] p-4 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <SearchIcon className="h-5 w-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search study spots..."
            className="w-full bg-transparent text-base outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>
      </div>

      <SpotFilters selected={selectedFilter} onSelect={setSelectedFilter} />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="spotly-skeleton h-36 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="spotly-card px-6 py-12 text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-3 font-semibold text-[#1E3A5F] dark:text-white">No spots found.</p>
          <p className="text-sm text-gray-500 dark:text-slate-300">Try a different filter.</p>
          <Link
            href={query.trim() ? `/spots/new?q=${encodeURIComponent(query.trim())}` : '/spots/new'}
            className="spotly-button-primary mt-4 inline-block"
          >
            Add this spot
          </Link>
        </div>
      ) : (
        <SpotGrid spots={results} />
      )}
    </div>
  );
}
