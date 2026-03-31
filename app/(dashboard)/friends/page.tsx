'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

type FriendUser = { id: string; username: string; displayName?: string | null; avatar?: string | null };

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incoming, setIncoming] = useState<Array<{ id: string; user: FriendUser }>>([]);
  const [outgoing, setOutgoing] = useState<Array<{ id: string; user: FriendUser }>>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendUser[]>([]);

  async function loadFriends() {
    const res = await fetch('/api/friends');
    if (!res.ok) return;
    const data = (await res.json()) as {
      friends: FriendUser[];
      incoming: Array<{ id: string; user: FriendUser }>;
      outgoing: Array<{ id: string; user: FriendUser }>;
    };
    setFriends(data.friends);
    setIncoming(data.incoming);
    setOutgoing(data.outgoing);
  }

  useEffect(() => {
    void loadFriends();
  }, []);

  async function searchUsers(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { users: FriendUser[] };
    setResults(data.users.slice(0, 8));
  }

  async function addFriend(userId: string) {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = (await res.json()) as { error?: string; accepted?: boolean };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not send friend request');
      return;
    }
    toast.success(data.accepted ? 'Friend request accepted' : 'Friend request sent');
    await loadFriends();
  }

  async function acceptFriendRequest(id: string) {
    const res = await fetch(`/api/friends/${id}/accept`, { method: 'POST' });
    if (!res.ok) {
      toast.error('Could not accept friend request');
      return;
    }
    toast.success('Friend added');
    await loadFriends();
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Friends</h1>
        <p className="text-sm text-gray-500 dark:text-slate-300">Build your Spotly circle and tag friends in reviews.</p>
      </div>

      <div className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 dark:bg-slate-900">
          <Search className="h-4 w-4 text-[#2563EB]" />
          <input
            value={query}
            onChange={(e) => void searchUsers(e.target.value)}
            placeholder="Search Spotly users"
            className="w-full bg-transparent text-sm outline-none dark:text-white"
          />
        </div>
        {results.length > 0 ? (
          <div className="mt-3 space-y-2">
            {results.map((person) => (
              <div key={person.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-3 dark:bg-slate-900">
                <Link href={`/profile/${person.username}`} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">{person.displayName ?? person.username}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-300">@{person.username}</p>
                </Link>
                <button type="button" onClick={() => addFriend(person.id)} className="spotly-button-secondary px-3 py-2 text-sm">
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Friend requests</h2>
        {incoming.length === 0 ? (
          <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-500 shadow-md dark:bg-slate-800 dark:text-slate-300">
            No incoming friend requests.
          </div>
        ) : (
          incoming.map((request) => (
            <div key={request.id} className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
              <p className="font-semibold text-[#1E3A5F] dark:text-white">{request.user.displayName ?? request.user.username}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">@{request.user.username}</p>
              <button type="button" onClick={() => acceptFriendRequest(request.id)} className="spotly-button-primary mt-3 w-full py-2 text-sm">
                Accept
              </button>
            </div>
          ))
        )}
        {outgoing.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Pending</h3>
            {outgoing.map((request) => (
              <div key={request.id} className="rounded-xl bg-white px-4 py-3 text-sm text-gray-600 shadow-md dark:bg-slate-900 dark:text-slate-300">
                Waiting on {request.user.displayName ?? request.user.username}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Your friends</h2>
          <Link href="/messages" className="text-sm font-semibold text-[#2563EB]">
            Open messages
          </Link>
        </div>
        {friends.length === 0 ? (
          <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-500 shadow-md dark:bg-slate-800 dark:text-slate-300">
            No friends yet. Add a few and you’ll be able to tag them in ratings.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend) => (
              <div key={friend.id} className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
                <Link href={`/profile/${friend.username}`} className="block">
                  <p className="font-semibold text-[#1E3A5F] dark:text-white">{friend.displayName ?? friend.username}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-300">@{friend.username}</p>
                </Link>
                <div className="mt-3 flex gap-2">
                  <Link href={`/messages?user=${friend.id}`} className="spotly-button-primary flex-1 py-2 text-center text-sm">
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
