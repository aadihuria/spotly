export function TypingIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return <p className="text-xs text-cyan-300">Someone is typing...</p>;
}
