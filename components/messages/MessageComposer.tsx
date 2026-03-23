export function MessageComposer() {
  return (
    <form className="glass mt-2 flex gap-2 rounded-2xl p-2">
      <input className="flex-1 rounded-lg bg-white/10 p-3" placeholder="Type a message..." />
      <button className="btn-glow">Send</button>
    </form>
  );
}
