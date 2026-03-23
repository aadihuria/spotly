import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  let conversationId = body.conversationId as string | undefined;
  if (!conversationId && body.recipientId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { hasEvery: [session.user.id, body.recipientId] },
      },
    });
    if (existing) {
      conversationId = existing.id;
    } else {
      const newConv = await prisma.conversation.create({ data: { participants: [session.user.id, body.recipientId] } });
      conversationId = newConv.id;
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: body.recipientId,
      conversationId,
      content: body.content,
      imageUrl: body.imageUrl,
      type: body.imageUrl ? 'image' : 'text',
      readBy: [session.user.id],
    },
  });

  if (conversationId) await pusherServer.trigger(`conversation-${conversationId}`, 'new-message', message);
  return NextResponse.json({ message }, { status: 201 });
}
