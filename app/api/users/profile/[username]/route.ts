import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await getServerSession();
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      university: true,
      major: true,
      graduationYear: true,
      interests: true,
      reviews: {
        include: {
          spot: {
            include: { images: true },
          },
        },
        orderBy: [{ rating: 'desc' }, { updatedAt: 'desc' }],
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const friendship = session?.user?.id
    ? await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, addresseeId: user.id },
            { requesterId: user.id, addresseeId: session.user.id },
          ],
        },
      })
    : null;

  const friendCount = await prisma.friendship.count({
    where: {
      status: 'accepted',
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });

  const conversation =
    session?.user?.id && session.user.id !== user.id
      ? await prisma.conversation.findFirst({
          where: {
            participants: { hasEvery: [session.user.id, user.id] },
          },
          select: { id: true },
        })
      : null;

  return NextResponse.json({
    user: {
      ...user,
      friendCount,
      reviewCount: user.reviews.length,
      friendship: friendship
        ? {
            id: friendship.id,
            status: friendship.status,
            incoming: friendship.addresseeId === session?.user?.id,
          }
        : null,
      conversationId: conversation?.id ?? null,
    },
  });
}
