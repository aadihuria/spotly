'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all';

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  reviewCount: number;
  averageRating: number;
  spotCount: number;
  groupCount: number;
  friendCount: number;
  score: number;
  isCurrentUser: boolean;
};

const tabs: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All Time', value: 'all' },
];

export default function LeaderboardPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<LeaderboardPeriod>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?period=${tab}`);
      if (!res.ok) {
        setEntries([]);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { leaderboard: LeaderboardEntry[] };
      setEntries(data.leaderboard);
      setLoading(false);
    }

    void loadLeaderboard();
  }, [tab]);

  const podium = useMemo(() => {
    const topThree = entries.slice(0, 3);
    return [
      topThree[1] ? { ...topThree[1], place: 2, badge: '🥈', size: 'h-14 w-14', offset: 'mt-6' } : null,
      topThree[0] ? { ...topThree[0], place: 1, badge: '🥇', size: 'h-16 w-16', offset: '' } : null,
      topThree[2] ? { ...topThree[2], place: 3, badge: '🥉', size: 'h-14 w-14', offset: 'mt-8' } : null,
    ].filter(Boolean) as Array<LeaderboardEntry & { place: number; badge: string; size: string; offset: string }>;
  }, [entries]);

  const currentUserEntry = entries.find((entry) => entry.userId === user?.id);

  return (
    <div className="screen-width page-padding space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
          Real activity only: ratings, uploaded spots, groups, and new connections.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === item.value
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F3F4F6] text-gray-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {currentUserEntry ? (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">Your standing</p>
              <p className="mt-1 text-lg font-bold text-[#1E3A5F] dark:text-white">
                #{currentUserEntry.rank} in {tabs.find((item) => item.value === tab)?.label}
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-sm dark:bg-slate-900">
              {currentUserEntry.score} pts
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-white px-2 py-3 shadow-sm dark:bg-slate-900">
              <p className="text-base font-bold text-[#1E3A5F] dark:text-white">{currentUserEntry.reviewCount}</p>
              <p className="text-gray-500 dark:text-slate-300">Ratings</p>
            </div>
            <div className="rounded-2xl bg-white px-2 py-3 shadow-sm dark:bg-slate-900">
              <p className="text-base font-bold text-[#1E3A5F] dark:text-white">{currentUserEntry.spotCount}</p>
              <p className="text-gray-500 dark:text-slate-300">Spots</p>
            </div>
            <div className="rounded-2xl bg-white px-2 py-3 shadow-sm dark:bg-slate-900">
              <p className="text-base font-bold text-[#1E3A5F] dark:text-white">{currentUserEntry.groupCount}</p>
              <p className="text-gray-500 dark:text-slate-300">Groups</p>
            </div>
            <div className="rounded-2xl bg-white px-2 py-3 shadow-sm dark:bg-slate-900">
              <p className="text-base font-bold text-[#1E3A5F] dark:text-white">{currentUserEntry.friendCount}</p>
              <p className="text-gray-500 dark:text-slate-300">Friends</p>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="spotly-skeleton h-40" />
          <div className="space-y-3">
            <div className="spotly-skeleton h-20" />
            <div className="spotly-skeleton h-20" />
            <div className="spotly-skeleton h-20" />
          </div>
        </>
      ) : podium.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-end justify-center gap-4">
            {podium.map((entry) => (
              <Link key={entry.place} href={`/profile/${entry.username}`} className={`text-center ${entry.offset}`}>
                <div className="mb-2 text-2xl">{entry.badge}</div>
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.displayName ?? entry.username}
                    className={`mx-auto ${entry.size} rounded-full object-cover ${entry.place === 1 ? 'ring-4 ring-[#FACC15]' : ''}`}
                  />
                ) : (
                  <div
                    className={`mx-auto flex ${entry.size} items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-[#2563EB] ${
                      entry.place === 1 ? 'ring-4 ring-[#FACC15]' : ''
                    }`}
                  >
                    {(entry.displayName ?? entry.username)[0]?.toUpperCase()}
                  </div>
                )}
                <p className="mt-2 font-semibold text-[#1E3A5F] dark:text-white">{entry.displayName ?? entry.username}</p>
                <p className="text-sm text-gray-500 dark:text-slate-300">{entry.score} pts</p>
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <Link
                key={entry.userId}
                href={`/profile/${entry.username}`}
                className={`flex items-center gap-3 rounded-3xl p-4 shadow-md transition hover:scale-[1.01] ${
                  entry.isCurrentUser
                    ? 'border-l-4 border-[#2563EB] bg-blue-50 dark:bg-slate-800'
                    : 'bg-[#F3F4F6] dark:bg-slate-800'
                }`}
              >
                <div className="w-8 text-center text-lg font-bold text-[#1E3A5F] dark:text-white">#{entry.rank}</div>
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.displayName ?? entry.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-bold text-[#2563EB] dark:bg-slate-900">
                    {(entry.displayName ?? entry.username)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#1E3A5F] dark:text-white">
                    {entry.displayName ?? entry.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-300">
                    {entry.reviewCount} ratings · {entry.spotCount} spots · {entry.groupCount} groups · {entry.friendCount} friends
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-[#2563EB] px-3 py-1 text-sm font-semibold text-white">
                    {entry.score}
                  </span>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">
                    Avg {entry.averageRating.toFixed(1)}/10
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#F3F4F6] px-4 py-10 text-center shadow-md dark:bg-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2563EB] dark:bg-slate-900">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#1E3A5F] dark:text-white">No leaderboard activity yet</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
            Once people post ratings, upload spots, and start groups, the rankings will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
