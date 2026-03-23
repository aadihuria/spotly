export function ConversationList({ conversations }: { conversations: { id: string; title: string; unread: number }[] }) {
  return (
    <div className="glass rounded-2xl p-3">
      {conversations.map((c) => (
        <div key={c.id} className="rounded-lg p-2 hover:bg-white/10">
          <p className="text-sm font-medium">{c.title}</p>
          <p className="text-xs text-white/70">Unread: {c.unread}</p>
        </div>
      ))}
    </div>
  );
}
