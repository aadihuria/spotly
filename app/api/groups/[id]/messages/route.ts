import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const membership = await prisma.groupMember.findFirst({ where: { groupId: id, userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { groupId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const membership = await prisma.groupMember.findFirst({ where: { groupId: id, userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const message = await prisma.message.create({
    data: {
      groupId: id,
      senderId: session.user.id,
      content: body.content,
      type: body.type ?? 'text',
      readBy: [session.user.id],
    },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });
  await prisma.studyGroup.update({ where: { id }, data: { updatedAt: new Date() } });
  if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.PUSHER_SECRET) {
    try {
      await pusherServer.trigger(`group-${id}`, 'new-message', message);
    } catch (error) {
      console.error('Pusher group trigger failed:', error);
    }
  }
  return NextResponse.json({ message }, { status: 201 });
}
