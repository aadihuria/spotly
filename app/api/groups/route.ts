import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const groups = await prisma.studyGroup.findMany({ include: { members: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const group = await prisma.studyGroup.create({
    data: {
      ...body,
      interests: body.interests ?? [],
      meetingJson: body.meetingSchedule ?? [],
      pinnedMessages: [],
      createdById: session.user.id,
      members: { create: { userId: session.user.id, role: 'admin' } },
    },
  });
  return NextResponse.json({ group }, { status: 201 });
}
