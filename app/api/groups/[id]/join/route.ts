import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const group = await prisma.studyGroup.findUnique({ where: { id } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existingMember = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: session.user.id },
  });
  if (existingMember) {
    return NextResponse.json({ member: existingMember, joined: true });
  }

  if (group.joinApproval === 'manual') {
    const request = await prisma.groupJoinRequest.upsert({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.user.id,
        },
      },
      update: {},
      create: { groupId: id, userId: session.user.id },
    });
    return NextResponse.json({ request, pending: true });
  }

  const member = await prisma.groupMember.create({ data: { groupId: id, userId: session.user.id } });
  return NextResponse.json({ member });
}
