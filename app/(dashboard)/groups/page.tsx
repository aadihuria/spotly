import Link from 'next/link';
import { GroupCard } from '@/components/groups/GroupCard';

const groups = [
  { id: 'g1', name: 'EECS 281 Night Owls', type: 'course', members: 42 },
  { id: 'g2', name: 'ML Reading Group', type: 'interest', members: 18 },
];

export default function GroupsPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Study Groups</h1>
        <Link href="/groups/new" className="btn-glow">Create group</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => <GroupCard key={group.id} group={group} />)}
      </div>
    </section>
  );
}
