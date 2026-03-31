import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await prisma.groupMember.findMany({ where: { groupId: id } });
  return NextResponse.json({ members });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const group = await prisma.studyGroup.findUnique({ where: { id }, select: { createdById: true } });
  if (!group || group.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const member = await prisma.groupMember.create({ data: { groupId: id, userId: body.userId, role: body.role ?? 'member' } });
  return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { userId } = await req.json();
  const group = await prisma.studyGroup.findUnique({ where: { id }, select: { createdById: true } });
  if (!group || (group.createdById !== session.user.id && userId !== session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.groupMember.delete({ where: { groupId_userId: { groupId: id, userId } } });
  return NextResponse.json({ ok: true });
}
