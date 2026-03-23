import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const group = await prisma.studyGroup.findUnique({ where: { id: params.id } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (group.joinApproval === 'manual') {
    const request = await prisma.groupJoinRequest.create({ data: { groupId: params.id, userId: session.user.id } });
    return NextResponse.json({ request, pending: true });
  }

  const member = await prisma.groupMember.create({ data: { groupId: params.id, userId: session.user.id } });
  return NextResponse.json({ member });
}
