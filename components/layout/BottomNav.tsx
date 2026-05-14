'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, MessageSquare, Newspaper, Search, Trophy, UserCircle, Users } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/hooks/useUser';

const items = [
  { href: '/dashboard', label: 'Feed', icon: Newspaper },
  { href: '/lists', label: 'Lists', icon: Bookmark },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { user } = useUser();
  const avatarUrl = profile?.avatar ?? null;
  const initial = (profile?.displayName || user?.name || profile?.username || 'S').charAt(0).toUpperCase();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden dark:border-slate-800 dark:bg-slate-950">
      <div className="grid grid-cols-7 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const isProfile = item.href === '/profile';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl border-t-2 px-1 py-2 active:opacity-85 ${
                active ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-400'
              }`}
            >
              {isProfile ? (
                avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={`h-5 w-5 rounded-full object-cover ${active ? 'ring-2 ring-[#2563EB]' : ''}`}
                  />
                ) : (
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                      active ? 'bg-[#2563EB] text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {initial}
                  </div>
                )
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
