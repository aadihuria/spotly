'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BellRing, MessageSquare, MessageSquarePlus, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { useUser } from '@/hooks/useUser';

type Conversation = {
  id: string;
  title: string;
  avatar?: string | null;
  participants: string[];
  lastMessage?: { content: string; createdAt: string } | null;
  requestStatus?: string | null;
  updatedAt?: string;
};

type GroupChat = {
  id: string;
  name: string;
  updatedAt?: string;
  messages: { content: string; createdAt: string }[];
};

type IncomingRequest = {
  id: string;
  requester: { id: string; username: string; displayName?: string | null };
  initialMessage?: string | null;
};

type OutgoingRequest = {
  id: string;
  recipient: { id: string; username: string; displayName?: string | null };
  initialMessage?: string | null;
};

type ThreadMessage = {
  id: string;
  sender: { id: string; username: string; displayName?: string | null; avatar?: string | null };
  content: string;
  createdAt: string;
};

function formatRelativeTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const friendRecipientId = searchParams.get('user');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [draftRecipientId, setDraftRecipientId] = useState<string | null>(friendRecipientId);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [composer, setComposer] = useState('');
  const [peopleQuery, setPeopleQuery] = useState('');
  const [peopleResults, setPeopleResults] = useState<Array<{ id: string; username: string; displayName?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  async function loadInbox() {
    const [messagesRes, requestsRes] = await Promise.all([fetch('/api/messages'), fetch('/api/messages/requests')]);

    if (messagesRes.ok) {
      const data = (await messagesRes.json()) as { conversations: Conversation[]; groupChats: GroupChat[] };
      setConversations(data.conversations);
      setGroupChats(data.groupChats);

      if (friendRecipientId) {
        const existing = data.conversations.find((conversation) => conversation.participants.includes(friendRecipientId));
        if (existing) {
          setSelectedConversationId(existing.id);
          setSelectedGroupId(null);
          setDraftRecipientId(friendRecipientId);
        } else {
          setSelectedConversationId(null);
          setSelectedGroupId(null);
          setDraftRecipientId(friendRecipientId);
        }
      } else if (!selectedConversationId && !selectedGroupId) {
        setSelectedConversationId(data.conversations[0]?.id ?? null);
        setSelectedGroupId(data.conversations[0] ? null : data.groupChats[0]?.id ?? null);
      }
    }

    if (requestsRes.ok) {
      const data = (await requestsRes.json()) as { incoming: IncomingRequest[]; outgoing: OutgoingRequest[] };
      setIncomingRequests(data.incoming);
      setOutgoingRequests(data.outgoing);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendRecipientId, selectedConversationId, selectedGroupId]);

  useEffect(() => {
    async function loadThread() {
      const targetId = selectedGroupId ?? selectedConversationId;
      if (!targetId) {
        setMessages([]);
        return;
      }

      const endpoint = selectedGroupId ? `/api/groups/${selectedGroupId}/messages` : `/api/messages/${selectedConversationId}`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        setMessages([]);
        return;
      }

      const data = (await res.json()) as { messages: ThreadMessage[] };
      setMessages(data.messages);
    }

    void loadThread();
  }, [selectedConversationId, selectedGroupId]);

  async function sendMessage() {
    const content = composer.trim();
    if (!content) return;

    const endpoint = selectedGroupId ? `/api/groups/${selectedGroupId}/messages` : '/api/messages/send';
    const payload = selectedGroupId
      ? { content }
      : selectedConversationId
        ? { conversationId: selectedConversationId, content }
        : draftRecipientId
          ? { recipientId: draftRecipientId, content }
          : null;

    if (!payload) {
      toast.error('Choose a chat first');
      return;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { requested?: boolean; error?: string; message?: ThreadMessage };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not send message');
      return;
    }

    if (data.requested) {
      toast.success('DM request sent');
      setComposer('');
      await loadInbox();
      return;
    }

    setComposer('');
    if (data.message) {
      const nextMessage = data.message;
      setMessages((current) => [...current, nextMessage]);
    }
    await loadInbox();
  }

  async function acceptRequest(requestId: string) {
    const res = await fetch(`/api/messages/requests/${requestId}/accept`, { method: 'POST' });
    const data = (await res.json()) as { conversationId?: string; error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not accept request');
      return;
    }

    toast.success('DM request accepted');
    setSelectedConversationId(data.conversationId ?? null);
    setSelectedGroupId(null);
    await loadInbox();
  }

  async function requestDm(recipientId: string) {
    const res = await fetch('/api/messages/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, initialMessage: 'Hey! Would love to connect on Spotly.' }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not request DM');
      return;
    }

    toast.success('DM request sent');
    setPeopleQuery('');
    setPeopleResults([]);
    await loadInbox();
  }

  async function searchPeople(query: string) {
    setPeopleQuery(query);
    if (!query.trim()) {
      setPeopleResults([]);
      return;
    }

    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { users: Array<{ id: string; username: string; displayName?: string | null }> };
    setPeopleResults(data.users.filter((person) => person.id !== user?.id).slice(0, 6));
  }

  const selectedTitle = useMemo(() => {
    if (selectedGroupId) return groupChats.find((group) => group.id === selectedGroupId)?.name ?? 'Group chat';
    if (!selectedConversationId && draftRecipientId) {
      const draftPerson = peopleResults.find((person) => person.id === draftRecipientId);
      return draftPerson?.displayName ?? draftPerson?.username ?? 'New message';
    }
    return conversations.find((conversation) => conversation.id === selectedConversationId)?.title ?? 'Messages';
  }, [conversations, draftRecipientId, groupChats, peopleResults, selectedConversationId, selectedGroupId]);

  const selectedSubtitle = useMemo(() => {
    if (selectedGroupId) {
      const group = groupChats.find((item) => item.id === selectedGroupId);
      return group?.messages[0]?.content ? `Latest update: ${group.messages[0].content}` : 'Talk with everyone in this group.';
    }
    if (!selectedConversationId && draftRecipientId) {
      return 'You can send a DM request to start this chat.';
    }
    const conversation = conversations.find((item) => item.id === selectedConversationId);
    if (!conversation) return 'Choose a conversation to get started.';
    if (conversation.requestStatus === 'pending') return 'This conversation is waiting on a DM request.';
    return conversation.lastMessage?.content ?? 'Say hi and start the conversation.';
  }, [conversations, draftRecipientId, groupChats, selectedConversationId, selectedGroupId]);

  const selectedAvatar = useMemo(() => {
    if (selectedGroupId) return null;
    return conversations.find((item) => item.id === selectedConversationId)?.avatar ?? null;
  }, [conversations, selectedConversationId, selectedGroupId]);

  const directMessages = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    subtitle: conversation.lastMessage?.content ?? 'No messages yet',
    meta: formatRelativeTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt),
    active: selectedConversationId === conversation.id && !selectedGroupId,
    badge: conversation.requestStatus === 'pending' ? 'Pending' : null,
    avatar: conversation.avatar ?? null,
    initials: conversation.title.slice(0, 1).toUpperCase(),
    onClick: () => {
      setSelectedConversationId(conversation.id);
      setSelectedGroupId(null);
      setDraftRecipientId(null);
    },
  }));

  const groupMessageItems = groupChats.map((group) => ({
    id: `group-${group.id}`,
    title: group.name,
    subtitle: group.messages[0]?.content ?? 'Group chat is ready',
    meta: formatRelativeTime(group.messages[0]?.createdAt ?? group.updatedAt),
    badge: 'Group',
    initials: group.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    active: selectedGroupId === group.id,
    onClick: () => {
      setSelectedGroupId(group.id);
      setSelectedConversationId(null);
      setDraftRecipientId(null);
    },
  }));

  return (
    <section className="screen-width page-padding space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">
            Clean, focused conversations with friends and study groups.
          </p>
        </div>
        <Link href="/friends" className="spotly-button-secondary px-4 py-2 text-sm">
          Friends
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 dark:bg-slate-900">
              <Search className="h-4 w-4 text-[#2563EB]" />
              <input
                value={peopleQuery}
                onChange={(e) => void searchPeople(e.target.value)}
                placeholder="Find someone to message"
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
            {peopleResults.length > 0 ? (
              <div className="mt-3 space-y-2">
                {peopleResults.map((person) => (
                  <div key={person.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 dark:bg-slate-900">
                    <Link href={`/profile/${person.username}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1E3A5F] dark:text-white">
                        {person.displayName ?? person.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-300">@{person.username}</p>
                    </Link>
                    <button type="button" onClick={() => requestDm(person.id)} className="spotly-button-secondary px-3 py-2 text-sm">
                      <MessageSquarePlus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : peopleQuery.trim() ? (
              <div className="mt-3 rounded-2xl bg-white px-4 py-4 text-sm text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                No users found for “{peopleQuery}”.
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Inbox</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">
                  {conversations.length} direct chats · {groupChats.length} groups
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2563EB] dark:bg-slate-900">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-300">
                    Direct messages
                  </h3>
                  {incomingRequests.length > 0 ? (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-[#2563EB] dark:bg-slate-700 dark:text-blue-200">
                      {incomingRequests.length} new
                    </span>
                  ) : null}
                </div>
                <ConversationList conversations={directMessages} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-300">
                    Group chats
                  </h3>
                  {groupChats.length > 0 ? (
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#2563EB] dark:bg-slate-900">
                      {groupChats.length}
                    </span>
                  ) : null}
                </div>
                <ConversationList conversations={groupMessageItems} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F] dark:text-white">
              <BellRing className="h-4 w-4 text-[#2563EB]" />
              Requests
            </h2>
            <div className="mt-3 space-y-2">
              {incomingRequests.map((request) => (
                <div key={request.id} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">
                    {request.requester.displayName ?? request.requester.username}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">
                    {request.initialMessage || 'Wants to DM you on Spotly'}
                  </p>
                  <button type="button" onClick={() => acceptRequest(request.id)} className="spotly-button-primary mt-3 w-full py-2 text-sm">
                    Accept request
                  </button>
                </div>
              ))}
              {outgoingRequests.map((request) => (
                <div key={request.id} className="rounded-2xl bg-white p-3 text-sm text-gray-600 dark:bg-slate-900 dark:text-slate-300">
                  Waiting on {request.recipient.displayName ?? request.recipient.username}
                </div>
              ))}
              {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                <p className="rounded-2xl bg-white px-3 py-3 text-sm text-gray-500 dark:bg-slate-900 dark:text-slate-300">
                  No DM requests right now.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl bg-[#F3F4F6] px-4 py-4 shadow-md dark:bg-slate-800">
            <div className="flex items-center gap-3">
              {selectedAvatar ? (
                <img src={selectedAvatar} alt={selectedTitle} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-[#2563EB] dark:bg-slate-900">
                  {selectedTitle.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-[#1E3A5F] dark:text-white">{selectedTitle}</h2>
                <p className="truncate text-sm text-gray-500 dark:text-slate-300">{selectedSubtitle}</p>
              </div>
              <div className="hidden rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#2563EB] dark:bg-slate-900 sm:block">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                Active chat
              </div>
            </div>
          </div>

          {loading ? (
            <div className="spotly-skeleton h-[620px]" />
          ) : (
            <>
              <MessageThread
                messages={messages.map((message) => ({
                  id: message.id,
                  sender: message.sender.displayName ?? message.sender.username,
                  content: message.content,
                  mine: message.sender.id === user?.id,
                  avatar: message.sender.avatar ?? (message.sender.id === user?.id ? user?.image ?? null : null),
                  initials: (message.sender.displayName ?? message.sender.username).slice(0, 1).toUpperCase(),
                  time: new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                }))}
              />
              <MessageComposer
                value={composer}
                onChange={setComposer}
                onSend={sendMessage}
                disabled={!selectedConversationId && !selectedGroupId && !draftRecipientId}
                placeholder={
                  selectedGroupId
                    ? 'Send a message to the group...'
                    : draftRecipientId
                      ? 'Send a direct message request...'
                      : 'Type a direct message...'
                }
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
