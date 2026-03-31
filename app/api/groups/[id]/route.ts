import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
        },
      },
      messages: true,
    },
  });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ group });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.studyGroup.findUnique({ where: { id }, select: { createdById: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const group = await prisma.studyGroup.update({
    where: { id },
    data: {
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : undefined,
      description: typeof body.description === 'string' && body.description.trim() ? body.description.trim() : undefined,
      type: body.type === 'course' || body.type === 'interest' || body.type === 'major' ? body.type : undefined,
      course: typeof body.course === 'string' ? body.course.trim() || null : undefined,
      subject: typeof body.subject === 'string' ? body.subject.trim() || null : undefined,
      interests: Array.isArray(body.interests) ? body.interests : undefined,
      avatar: typeof body.avatar === 'string' ? body.avatar.trim() || null : undefined,
      coverImage: typeof body.coverImage === 'string' ? body.coverImage.trim() || null : undefined,
      meetingJson: Array.isArray(body.meetingSchedule)
        ? body.meetingSchedule
        : Array.isArray(body.meetingJson)
          ? body.meetingJson
          : undefined,
      location: typeof body.location === 'string' ? body.location.trim() || null : undefined,
      spotId: typeof body.spotId === 'string' ? body.spotId.trim() || null : undefined,
      maxMembers: typeof body.maxMembers === 'number' ? body.maxMembers : undefined,
      privacy: typeof body.privacy === 'string' && body.privacy.trim() ? body.privacy.trim() : undefined,
      joinApproval:
        typeof body.joinApproval === 'string' && body.joinApproval.trim() ? body.joinApproval.trim() : undefined,
    },
  });
  return NextResponse.json({ group });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.studyGroup.findUnique({ where: { id }, select: { createdById: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.createdById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.studyGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
