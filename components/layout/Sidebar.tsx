import Link from 'next/link';

const items = [
  ['Dashboard', '/dashboard'],
  ['Groups', '/groups'],
  ['Messages', '/messages'],
  ['Leaderboard', '/leaderboard'],
  ['Profile', '/profile/me'],
];

export function Sidebar() {
  return (
    <aside className="glass hidden h-fit w-60 rounded-2xl p-4 lg:block">
      <nav className="space-y-2">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
