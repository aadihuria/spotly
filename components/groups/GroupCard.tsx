import Link from 'next/link';

export function GroupCard({ group }: { group: { id: string; name: string; type: string; members: number } }) {
  return (
    <Link href={`/groups/${group.id}`} className="glass block rounded-2xl p-4">
      <h3 className="font-semibold">{group.name}</h3>
      <p className="text-sm text-white/70">{group.type} · {group.members} members</p>
    </Link>
  );
}
