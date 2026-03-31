import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, username: true, displayName: true, avatar: true } },
      addressee: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const friends = friendships
    .filter((item) => item.status === 'accepted')
    .map((item) => (item.requesterId === userId ? item.addressee : item.requester));

  const incoming = friendships
    .filter((item) => item.status === 'pending' && item.addresseeId === userId)
    .map((item) => ({ id: item.id, user: item.requester, createdAt: item.createdAt }));

  const outgoing = friendships
    .filter((item) => item.status === 'pending' && item.requesterId === userId)
    .map((item) => ({ id: item.id, user: item.addressee, createdAt: item.createdAt }));

  return NextResponse.json({ friends, incoming, outgoing });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const targetUserId = String(body.userId ?? '');
  const userId = session.user.id;

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: 'Choose a different user' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true, displayName: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: targetUserId },
        { requesterId: targetUserId, addresseeId: userId },
      ],
    },
  });

  if (existing?.status === 'accepted') {
    return NextResponse.json({ friendship: existing, accepted: true });
  }

  if (existing?.status === 'pending' && existing.addresseeId === userId) {
    const accepted = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: 'accepted' },
    });
    return NextResponse.json({ friendship: accepted, accepted: true });
  }

  if (existing?.status === 'pending') {
    return NextResponse.json({ friendship: existing, pending: true });
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId: userId,
      addresseeId: targetUserId,
      status: 'pending',
    },
  });

  return NextResponse.json({ friendship, pending: true }, { status: 201 });
}
