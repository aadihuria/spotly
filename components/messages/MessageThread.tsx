'use client';

import { useEffect, useRef } from 'react';

type ThreadMessage = {
  id: string;
  sender: string;
  content: string;
  mine?: boolean;
  time?: string;
  avatar?: string | null;
  initials?: string;
};

export function MessageThread({ messages }: { messages: ThreadMessage[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="h-[520px] space-y-3 overflow-y-auto rounded-3xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center rounded-2xl bg-white px-4 py-6 text-sm text-gray-500 dark:bg-slate-900 dark:text-slate-300">
          No messages yet. Start the conversation.
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.mine ? 'justify-end' : 'justify-start'}`}>
              {!message.mine ? (
                message.avatar ? (
                  <img src={message.avatar} alt={message.sender} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-[#2563EB] dark:bg-slate-700 dark:text-blue-200">
                    {message.initials ?? message.sender.slice(0, 1).toUpperCase()}
                  </div>
                )
              ) : null}

              <div
                className={`max-w-[80%] rounded-[20px] px-4 py-3 shadow-sm ${
                  message.mine
                    ? 'rounded-br-md bg-[#2563EB] text-white'
                    : 'rounded-bl-md bg-white text-[#1E3A5F] dark:bg-slate-900 dark:text-white'
                }`}
              >
                {!message.mine ? <p className="text-[11px] font-semibold opacity-80">{message.sender}</p> : null}
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.time ? <p className="mt-2 text-[10px] opacity-70">{message.time}</p> : null}
              </div>

              {message.mine ? (
                message.avatar ? (
                  <img src={message.avatar} alt={message.sender} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {message.initials ?? message.sender.slice(0, 1).toUpperCase()}
                  </div>
                )
              ) : null}
            </div>
          ))}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
}
