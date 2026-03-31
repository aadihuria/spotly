'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Search } from 'lucide-react';
import StudyMap from '@/components/StudyMap';
import { SpotCard } from '@/components/spots/SpotCard';
import { useStudySpots } from '@/hooks/useStudySpots';
import { useUser } from '@/hooks/useUser';
import { ANN_ARBOR_SPOTS } from '@/data/spots';
import type { Spot } from '@/types';

function SpotRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="spotly-skeleton h-36 w-40 flex-shrink-0" />
      ))}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">{title}</h2>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { spots, isLoading } = useStudySpots();
  const { user } = useUser();

  const feedSpots: Spot[] = spots.length > 0 ? spots : ANN_ARBOR_SPOTS;
  const topSpots = feedSpots.slice(0, 6);
  const popularSpots = feedSpots.slice(2, 8);
  const trendingSpots = feedSpots.slice(4, 10);
  const username = user?.name || user?.email?.split('@')[0] || 'friend';

  return (
    <div className="screen-width page-padding space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Spotly</span>
        </div>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-[#2563EB] dark:bg-slate-800"
        >
          {(username[0] || 'S').toUpperCase()}
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Welcome back, {username}! 👋</h1>
        <p className="text-sm text-gray-500 dark:text-slate-300">Find your next favorite campus study spot.</p>
      </div>

      <button
        type="button"
        onClick={() => router.push('/search')}
        className="flex w-full items-center gap-3 rounded-full bg-[#F3F4F6] px-4 py-3 text-left dark:bg-slate-800"
      >
        <Search className="h-5 w-5 text-gray-400" />
        <span className="flex-1 text-sm text-gray-500 dark:text-slate-300">Search study spots...</span>
        <Mic className="h-5 w-5 text-gray-400" />
      </button>

      <div className="flex gap-5 overflow-x-auto border-b border-gray-100 pb-2 text-sm font-medium dark:border-slate-800">
        {[
          ['Feed', '/dashboard'],
          ['Your Lists', '/lists'],
          ['Search', '/search'],
          ['Leaderboard', '/leaderboard'],
        ].map(([label, href], index) => (
          <Link
            key={label}
            href={href}
            className={`whitespace-nowrap border-b-2 pb-2 ${
              index === 0
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-gray-400 dark:text-slate-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="h-52 overflow-hidden rounded-2xl">
        <StudyMap spots={topSpots} height="208px" />
      </div>

      <section className="space-y-3">
        <SectionHeader title="Top Spots This Week" />
        {isLoading ? (
          <SpotRowSkeleton />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {topSpots.map((spot: Spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="Popular with Friends" />
        {isLoading ? (
          <SpotRowSkeleton />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {popularSpots.map((spot: Spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="New & Trending" />
        {isLoading ? (
          <SpotRowSkeleton />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {trendingSpots.map((spot: Spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
