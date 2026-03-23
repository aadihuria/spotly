import { GroupChat } from '@/components/groups/GroupChat';
import { GroupMemberList } from '@/components/groups/GroupMemberList';
import { GroupSettings } from '@/components/groups/GroupSettings';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[260px_1fr_260px]">
      <GroupMemberList members={['Alex', 'Jordan', 'Sam']} />
      <GroupChat messages={[{ id: '1', sender: 'Alex', content: 'Anyone free at 7pm?' }]} />
      <GroupSettings />
    </div>
  );
}
