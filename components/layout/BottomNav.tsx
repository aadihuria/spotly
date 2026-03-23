import Link from 'next/link';

export function BottomNav() {
  return (
    <nav className="glass fixed bottom-2 left-2 right-2 grid grid-cols-4 rounded-2xl p-2 lg:hidden">
      <Link href="/dashboard" className="p-2 text-center text-xs">Home</Link>
      <Link href="/groups" className="p-2 text-center text-xs">Groups</Link>
      <Link href="/messages" className="p-2 text-center text-xs">DMs</Link>
      <Link href="/profile/me" className="p-2 text-center text-xs">Profile</Link>
    </nav>
  );
}
