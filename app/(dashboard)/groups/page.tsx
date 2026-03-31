'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

type GroupRecord = {
  id: string;
  name: string;
  members: { userId: string }[];
  createdAt?: string;
};

export default function GroupsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [tab, setTab] = useState<'my' | 'discover'>('my');
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      const res = await fetch('/api/groups');
      if (!res.ok) return;
      const data = (await res.json()) as { groups: GroupRecord[] };
      setGroups(data.groups);
    }

    void loadGroups();
  }, []);

  const myGroups = useMemo(
    () => groups.filter((group) => group.members.some((member) => member.userId === user?.id)),
    [groups, user?.id]
  );
  const discoverGroups = useMemo(
    () => groups.filter((group) => !group.members.some((member) => member.userId === user?.id)),
    [groups, user?.id]
  );

  async function joinGroup(groupId: string) {
    setJoiningId(groupId);
    const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
    const data = (await res.json()) as { pending?: boolean; error?: string };
    setJoiningId(null);

    if (!res.ok) {
      toast.error(data.error ?? 'Could not join group');
      return;
    }

    toast.success(data.pending ? 'Join request sent' : 'Joined group');
    const refresh = await fetch('/api/groups');
    if (refresh.ok) {
      const payload = (await refresh.json()) as { groups: GroupRecord[] };
      setGroups(payload.groups);
    }
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Groups</h1>
        <button
          type="button"
          onClick={() => router.push('/groups/new')}
          className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
        >
          Create
        </button>
      </div>

      <div className="flex gap-6 border-b border-gray-100 pb-2 dark:border-slate-800">
        {[
          ['my', 'My Groups'],
          ['discover', 'Discover'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as 'my' | 'discover')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              tab === value ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'my' ? (
        <div className="space-y-3">
          {myGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#2563EB] dark:bg-slate-700">
                {group.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1E3A5F] dark:text-white">{group.name}</p>
                <p className="text-sm text-gray-500 dark:text-slate-300">{group.members.length} members</p>
                <p className="text-xs text-gray-400">Recently active</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          ))}
          {myGroups.length === 0 ? (
            <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-600 shadow-md dark:bg-slate-800 dark:text-slate-300">
              You haven’t joined any groups yet.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {discoverGroups.map((group) => (
            <div key={group.id} className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#2563EB] dark:bg-slate-700">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-semibold text-[#1E3A5F] dark:text-white">{group.name}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">{group.members.length} members</p>
              <button
                type="button"
                onClick={() => joinGroup(group.id)}
                disabled={joiningId === group.id}
                className="spotly-button-primary mt-4 w-full py-2 text-sm"
              >
                {joiningId === group.id ? 'Joining...' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
