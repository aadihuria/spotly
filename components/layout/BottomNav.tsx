'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, MessageSquare, Newspaper, Search, Trophy, UserCircle, Users } from 'lucide-react';

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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="grid grid-cols-7 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl border-t-2 px-1 py-2 active:opacity-85 ${
                active ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
