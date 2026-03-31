import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.directMessageRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  if (request.recipientId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let conversationId = request.conversationId;
  if (!conversationId) {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: { hasEvery: [request.requesterId, request.recipientId] },
      },
    });

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const conversation = await prisma.conversation.create({
        data: { participants: [request.requesterId, request.recipientId] },
      });
      conversationId = conversation.id;
    }
  }

  const updated = await prisma.directMessageRequest.update({
    where: { id },
    data: { status: 'accepted', conversationId },
  });

  return NextResponse.json({ request: updated, conversationId });
}
