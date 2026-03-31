import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      phone: true,
      instagram: true,
      snapchat: true,
      interests: true,
      university: true,
      spotsUploaded: {
        include: {
          images: true,
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (session.user.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      email: body.email,
      phone: body.phone,
      instagram: body.instagram,
      snapchat: body.snapchat,
      interests: Array.isArray(body.interests) ? body.interests : undefined,
      avatar: body.avatar,
      displayName: body.displayName,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      phone: true,
      instagram: true,
      snapchat: true,
      interests: true,
    },
  });

  return NextResponse.json({ user });
}
