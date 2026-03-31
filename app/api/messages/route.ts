import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const conversations = await prisma.conversation.findMany({
    where: { participants: { has: session.user.id } },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      dmRequest: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const participantIds = Array.from(new Set(conversations.flatMap((conversation) => conversation.participants).filter((id) => id !== userId)));
  const participants = participantIds.length
    ? await prisma.user.findMany({
        where: { id: { in: participantIds } },
        select: { id: true, username: true, displayName: true, avatar: true },
      })
    : [];

  const participantMap = new Map(participants.map((participant) => [participant.id, participant]));
  const groups = await prisma.studyGroup.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const serialized = conversations.map((conversation) => {
    const otherParticipant = conversation.participants.find((id) => id !== userId);
    const profile = otherParticipant ? participantMap.get(otherParticipant) : null;
    return {
      id: conversation.id,
      title: profile?.displayName ?? profile?.username ?? 'Conversation',
      avatar: profile?.avatar ?? null,
      participants: conversation.participants,
      lastMessage: conversation.messages[0] ?? null,
      updatedAt: conversation.updatedAt,
      requestStatus: conversation.dmRequest?.status ?? null,
    };
  });

  return NextResponse.json({ conversations: serialized, groupChats: groups });
}
