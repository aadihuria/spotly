export function GroupChat({ messages }: { messages: { id: string; content: string; sender: string }[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="space-y-2">
        {messages.map((m) => (
          <p key={m.id} className="rounded-lg bg-white/10 p-2 text-sm"><strong>{m.sender}:</strong> {m.content}</p>
        ))}
      </div>
    </div>
  );
}
