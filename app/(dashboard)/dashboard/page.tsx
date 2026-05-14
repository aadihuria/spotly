'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mic, Search, Sparkles } from 'lucide-react';
import StudyMap from '@/components/StudyMap';
import { SpotCard } from '@/components/spots/SpotCard';
import { useStudySpots } from '@/hooks/useStudySpots';
import { useUser } from '@/hooks/useUser';
import { ANN_ARBOR_SPOTS } from '@/data/spots';
import type { Spot } from '@/types';
import useSWR from 'swr';
import { useEffect } from 'react';

type SpotRecommendation = {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  tags: string[];
  reason: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

function AISpotCard({ rec }: { rec: SpotRecommendation }) {
  const filledStars = Math.max(1, Math.min(5, Math.round(rec.rating)));
  return (
    <Link
      href={`/spots/${rec.id}`}
      className="w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-md transition-transform hover:scale-[1.02] dark:bg-slate-900"
    >
      <div className="relative h-24 w-full bg-gray-200 dark:bg-slate-700">
        <Image src={rec.image} alt={rec.name} fill className="object-cover" sizes="176px" />
        <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
          <Sparkles className="h-2.5 w-2.5" /> AI
        </span>
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{rec.name}</p>
        <p className="line-clamp-2 text-[10px] leading-tight text-gray-500 dark:text-slate-300">{rec.reason}</p>
        <div className="flex items-center gap-1 text-xs">
          <span className="tracking-tight text-[#FACC15]">
            {'★'.repeat(filledStars)}{'☆'.repeat(5 - filledStars)}
          </span>
          <span className="font-medium text-[#2563EB]">{rec.rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { spots, isLoading } = useStudySpots();
  const { user } = useUser();
  const { data: recData, isLoading: recLoading } = useSWR<{ recommendations: SpotRecommendation[] }>(
    '/api/recommendations/spots',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );
  const { data: meData } = useSWR<{ user: { interests: string[] } }>('/api/users/me', fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (meData?.user && meData.user.interests.length === 0) {
      router.replace('/onboarding');
    }
  }, [meData, router]);

  const feedSpots: Spot[] = spots.length > 0 ? spots : ANN_ARBOR_SPOTS;
  const topSpots = feedSpots.slice(0, 6);
  const popularSpots = feedSpots.slice(2, 8);
  const trendingSpots = feedSpots.slice(4, 10);
  const username = user?.name || user?.email?.split('@')[0] || 'friend';
  const aiRecs = recData?.recommendations ?? [];

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

      {(recLoading || aiRecs.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <SectionHeader title="Recommended for You" />
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#2563EB] dark:bg-slate-800 dark:text-blue-400">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          {recLoading ? (
            <SpotRowSkeleton />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {aiRecs.map((rec) => (
                <AISpotCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </section>
      )}

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
