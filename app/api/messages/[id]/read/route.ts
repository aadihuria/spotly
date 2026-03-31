import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (
    message.recipientId !== session.user.id &&
    !message.readBy.includes(session.user.id) &&
    message.senderId !== session.user.id
  ) {
    const conversation = message.conversationId
      ? await prisma.conversation.findUnique({ where: { id: message.conversationId } })
      : null;
    if (!conversation || !conversation.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { readBy: Array.from(new Set([...message.readBy, session.user.id])) },
  });

  return NextResponse.json({ message: updated });
}
