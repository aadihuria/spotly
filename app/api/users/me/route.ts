import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      interests: true,
      major: true,
      bio: true,
      university: true,
      graduationYear: true,
      instagram: true,
      snapchat: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    interests?: string[];
    displayName?: string;
    bio?: string;
    major?: string;
    graduationYear?: number | null;
    instagram?: string;
    snapchat?: string;
  };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(Array.isArray(body.interests) && { interests: body.interests }),
      ...(body.displayName !== undefined && { displayName: body.displayName || null }),
      ...(body.bio !== undefined && { bio: body.bio || null }),
      ...(body.major !== undefined && { major: body.major || null }),
      ...(body.graduationYear !== undefined && { graduationYear: body.graduationYear || null }),
      ...(body.instagram !== undefined && { instagram: body.instagram || null }),
      ...(body.snapchat !== undefined && { snapchat: body.snapchat || null }),
    },
    select: { id: true, interests: true, displayName: true, bio: true, major: true, graduationYear: true },
  });

  return NextResponse.json({ user });
}
