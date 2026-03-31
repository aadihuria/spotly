'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bookmark, GraduationCap, MessageSquare, Newspaper, Search, Trophy, UserCircle, Users } from 'lucide-react';
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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'Spotly member';
  const userSubline = user?.email || 'Signed in';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 hidden border-b border-gray-100 bg-white/95 backdrop-blur md:block dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto grid max-w-screen-xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 lg:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] dark:bg-slate-800">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Spotly</p>
            <p className="text-xs text-gray-500 dark:text-slate-300">Find your next great study spot</p>
          </div>
        </div>

        <nav className="grid min-w-0 grid-cols-7 gap-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-full px-2 py-2.5 text-xs font-medium transition-colors active:opacity-85 lg:px-3 lg:text-sm ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#1E3A5F] hover:bg-gray-100 dark:text-white dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-3 rounded-2xl bg-gray-50 px-3 py-3 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
            {userInitial}
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="max-w-[160px] truncate text-sm font-semibold text-[#1E3A5F] dark:text-white">{userName}</p>
            <p className="max-w-[160px] truncate text-xs text-gray-500 dark:text-slate-300">{userSubline}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="spotly-button-primary ml-1 px-3 py-2 text-sm"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
