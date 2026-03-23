import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { TypingIndicator } from '@/components/messages/TypingIndicator';

export default function MessagesPage() {
  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <ConversationList conversations={[{ id: '1', title: 'Taylor', unread: 2 }]} />
      <div>
        <MessageThread messages={[{ id: '1', sender: 'Taylor', content: 'Meet at Dude?' }]} />
        <TypingIndicator active />
        <MessageComposer />
      </div>
    </section>
  );
}
