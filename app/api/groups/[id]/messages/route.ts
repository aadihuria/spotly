import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const messages = await prisma.message.findMany({ where: { groupId: params.id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const message = await prisma.message.create({ data: { groupId: params.id, senderId: session.user.id, content: body.content, type: body.type ?? 'text', readBy: [session.user.id] } });
  await pusherServer.trigger(`group-${params.id}`, 'new-message', message);
  return NextResponse.json({ message }, { status: 201 });
}
