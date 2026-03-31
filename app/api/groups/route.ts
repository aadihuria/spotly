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
  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();

  if (!name || !description) {
    return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
  }

  const group = await prisma.studyGroup.create({
    data: {
      name,
      description,
      type: body.type === 'interest' || body.type === 'major' ? body.type : 'course',
      course: typeof body.course === 'string' && body.course.trim() ? body.course.trim() : null,
      subject: typeof body.subject === 'string' && body.subject.trim() ? body.subject.trim() : null,
      interests: Array.isArray(body.interests) ? body.interests : [],
      avatar: typeof body.avatar === 'string' && body.avatar.trim() ? body.avatar.trim() : null,
      coverImage: typeof body.coverImage === 'string' && body.coverImage.trim() ? body.coverImage.trim() : null,
      meetingJson: Array.isArray(body.meetingSchedule) ? body.meetingSchedule : [],
      location: typeof body.location === 'string' && body.location.trim() ? body.location.trim() : null,
      spotId: typeof body.spotId === 'string' && body.spotId.trim() ? body.spotId.trim() : null,
      maxMembers: typeof body.maxMembers === 'number' ? body.maxMembers : undefined,
      privacy: typeof body.privacy === 'string' && body.privacy.trim() ? body.privacy.trim() : undefined,
      joinApproval:
        typeof body.joinApproval === 'string' && body.joinApproval.trim() ? body.joinApproval.trim() : undefined,
      pinnedMessages: [],
      createdById: session.user.id,
      members: { create: { userId: session.user.id, role: 'admin' } },
    },
  });
  return NextResponse.json({ group }, { status: 201 });
}
