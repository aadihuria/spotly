export function MessageThread({ messages }: { messages: { id: string; sender: string; content: string }[] }) {
  return (
    <div className="glass h-[480px] space-y-2 overflow-y-auto rounded-2xl p-4">
      {messages.map((m) => (
        <p key={m.id} className="rounded-lg bg-white/10 p-2 text-sm"><strong>{m.sender}:</strong> {m.content}</p>
      ))}
    </div>
  );
}
