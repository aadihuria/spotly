'use client';

type ConversationItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  unread?: number;
  active?: boolean;
  onClick?: () => void;
  badge?: string | null;
  avatar?: string | null;
  initials?: string;
};

export function ConversationList({ conversations }: { conversations: ConversationItem[] }) {
  return (
    <div className="space-y-2 rounded-3xl bg-[#F3F4F6] p-3 shadow-md dark:bg-slate-800">
      {conversations.length === 0 ? (
        <div className="rounded-2xl bg-white px-4 py-6 text-sm text-gray-500 dark:bg-slate-900 dark:text-slate-300">
          No conversations yet.
        </div>
      ) : (
        conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={conversation.onClick}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
              conversation.active
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'bg-white text-[#1E3A5F] hover:bg-gray-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-950'
            }`}
          >
            {conversation.avatar ? (
              <img src={conversation.avatar} alt={conversation.title} className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  conversation.active
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-[#2563EB] dark:bg-slate-700 dark:text-blue-200'
                }`}
              >
                {conversation.initials ?? conversation.title.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold">{conversation.title}</p>
                {conversation.meta ? <p className="shrink-0 text-[11px] opacity-75">{conversation.meta}</p> : null}
              </div>
              {conversation.subtitle ? <p className="mt-1 truncate text-xs opacity-80">{conversation.subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-2">
              {conversation.badge ? (
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    conversation.active
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-[#2563EB] dark:bg-slate-700 dark:text-blue-200'
                  }`}
                >
                  {conversation.badge}
                </span>
              ) : null}
              {conversation.unread ? (
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    conversation.active ? 'bg-white text-[#2563EB]' : 'bg-[#2563EB] text-white'
                  }`}
                >
                  {conversation.unread}
                </span>
              ) : null}
            </div>
          </button>
        ))
      )}
    </div>
  );
}
