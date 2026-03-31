import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

async function areFriends(userId: string, otherUserId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
    },
  });
  return Boolean(friendship);
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const requests = await prisma.directMessageRequest.findMany({
    where: {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    include: {
      requester: { select: { id: true, username: true, displayName: true, avatar: true } },
      recipient: { select: { id: true, username: true, displayName: true, avatar: true } },
      conversation: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const incoming = requests.filter((item) => item.recipientId === userId && item.status === 'pending');
  const outgoing = requests.filter((item) => item.requesterId === userId && item.status === 'pending');

  return NextResponse.json({ incoming, outgoing });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const recipientId = String(body.recipientId ?? '');
  const initialMessage = typeof body.initialMessage === 'string' ? body.initialMessage.trim() : '';
  const requesterId = session.user.id;

  if (!recipientId || recipientId === requesterId) {
    return NextResponse.json({ error: 'Choose a different user' }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (await areFriends(requesterId, recipientId)) {
    return NextResponse.json({ error: 'You can message this friend directly' }, { status: 400 });
  }

  const existing = await prisma.directMessageRequest.findFirst({
    where: {
      OR: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    },
  });

  if (existing?.status === 'pending' && existing.recipientId === requesterId) {
    return NextResponse.json({ error: 'This user already sent you a DM request' }, { status: 409 });
  }

  if (existing?.status === 'pending') {
    return NextResponse.json({ request: existing, pending: true });
  }

  const request = existing
    ? await prisma.directMessageRequest.update({
        where: { id: existing.id },
        data: { requesterId, recipientId, initialMessage, status: 'pending', conversationId: null },
      })
    : await prisma.directMessageRequest.create({
        data: { requesterId, recipientId, initialMessage, status: 'pending' },
      });

  return NextResponse.json({ request, pending: true }, { status: 201 });
}
