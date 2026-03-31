'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { MessageThread } from '@/components/messages/MessageThread';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { SpotGrid } from '@/components/spots/SpotGrid';
import { ANN_ARBOR_SPOTS } from '@/data/spots';

type GroupDetail = {
  id: string;
  name: string;
  description: string;
  members: { userId: string; role: string; user: { username: string; displayName?: string | null; avatar?: string | null } }[];
};

const activity = [
  'Maya saved Shapiro Undergraduate Library',
  'Jordan created a study sprint for tonight',
  'Aadi added a quiet cafe to the shared list',
];

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [groupMessages, setGroupMessages] = useState<Array<{ id: string; sender: { id: string; username: string; displayName?: string | null }; content: string; createdAt: string }>>([]);
  const [composer, setComposer] = useState('');

  useEffect(() => {
    async function loadGroup() {
      const [groupRes, messagesRes] = await Promise.all([
        fetch(`/api/groups/${params.id}`),
        fetch(`/api/groups/${params.id}/messages`),
      ]);
      if (groupRes.ok) {
        const data = (await groupRes.json()) as { group: GroupDetail };
        setGroup(data.group);
      }
      if (messagesRes.ok) {
        const data = (await messagesRes.json()) as {
          messages: Array<{ id: string; sender: { id: string; username: string; displayName?: string | null }; content: string; createdAt: string }>;
        };
        setGroupMessages(data.messages);
      }
    }

    if (params.id) {
      void loadGroup();
    }
  }, [params.id]);

  async function sendGroupMessage() {
    if (!composer.trim()) return;
    const res = await fetch(`/api/groups/${params.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: composer.trim() }),
    });

    const data = (await res.json()) as { error?: string; message?: any };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not send group message');
      return;
    }

    setGroupMessages((current) => [...current, data.message]);
    setComposer('');
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/groups"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{group?.name ?? 'Group'}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">{group?.members.length ?? 0} members</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200"
          alt="Study group"
          width={1200}
          height={600}
          className="h-48 w-full object-cover"
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-slate-300">{group?.description ?? 'Study together and share great spots.'}</p>

      {(group?.members?.length ?? 0) > 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
          <div className="flex -space-x-3">
            {group!.members.slice(0, 5).map((member) =>
              member.user.avatar ? (
                <img
                  key={member.userId}
                  src={member.user.avatar}
                  alt={member.user.username}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-slate-900"
                />
              ) : (
                <div
                  key={member.userId}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-xs font-bold text-white dark:border-slate-900"
                >
                  {(member.user.displayName ?? member.user.username)[0]?.toUpperCase()}
                </div>
              )
            )}
          </div>
          <div>
            <p className="font-semibold text-[#1E3A5F] dark:text-white">All members</p>
            <p className="text-sm text-gray-500 dark:text-slate-300">
              See everyone in the group and open their Spotly profiles.
            </p>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Members</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(group?.members ?? []).map((member) => (
            <Link
              key={member.userId}
              href={`/profile/${member.user.username}`}
              className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800"
            >
              {member.user.avatar ? (
                <img src={member.user.avatar} alt={member.user.username} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                  {(member.user.displayName ?? member.user.username)[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1E3A5F] dark:text-white">{member.user.displayName ?? member.user.username}</p>
                <p className="text-sm text-gray-500 dark:text-slate-300">@{member.user.username}</p>
              </div>
              <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB] dark:bg-slate-900">
                {member.role}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Shared Spots</h2>
        <SpotGrid spots={ANN_ARBOR_SPOTS.slice(0, 4)} />
      </section>

      <section className="spotly-card p-4">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Activity</h2>
        <div className="mt-4 space-y-3">
          {activity.map((item) => (
            <div key={item} className="rounded-xl bg-white px-3 py-3 text-sm text-gray-600 dark:bg-slate-900 dark:text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Group Chat</h2>
        <MessageThread
          messages={groupMessages.map((message) => ({
            id: message.id,
            sender: message.sender.displayName ?? message.sender.username,
            content: message.content,
            mine: message.sender.id === user?.id,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          }))}
        />
        <MessageComposer
          value={composer}
          onChange={setComposer}
          onSend={sendGroupMessage}
          placeholder="Send a message to the group..."
        />
      </section>
    </div>
  );
}
