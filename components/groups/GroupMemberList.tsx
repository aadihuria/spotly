export function GroupMemberList({ members }: { members: string[] }) {
  return <div className="glass rounded-2xl p-4 text-sm">Members: {members.join(', ')}</div>;
}
