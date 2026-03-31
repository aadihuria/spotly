import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { ensureStaticSpotExists } from '@/lib/static-spots';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { spotId: id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const spot = await ensureStaticSpotExists(prisma, id, session.user.id);
  if (!spot) {
    return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
  }
  const body = await req.json();
  if (body.reaction !== 'liked' && body.reaction !== 'okay' && body.reaction !== 'disliked') {
    return NextResponse.json({ error: 'Choose how you felt about the spot' }, { status: 400 });
  }

  if (!body.visitDate) {
    return NextResponse.json({ error: 'Visit date is required' }, { status: 400 });
  }

  const numericRating = Number(body.rating);
  if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 10) {
    return NextResponse.json({ error: 'Rating must be between 0 and 10' }, { status: 400 });
  }

  const requestedTagIds = Array.isArray(body.taggedFriendIds) ? body.taggedFriendIds.map(String) : [];

  const friendships = requestedTagIds.length
    ? await prisma.friendship.findMany({
        where: {
          status: 'accepted',
          OR: requestedTagIds.flatMap((friendId) => [
            { requesterId: session.user.id, addresseeId: friendId },
            { requesterId: friendId, addresseeId: session.user.id },
          ]),
        },
        include: {
          requester: { select: { id: true, username: true, displayName: true } },
          addressee: { select: { id: true, username: true, displayName: true } },
        },
      })
    : [];

  const taggedPeople = requestedTagIds
    .map((friendId) => {
      const friendship = friendships.find(
        (item) =>
          (item.requesterId === session.user.id && item.addresseeId === friendId) ||
          (item.requesterId === friendId && item.addresseeId === session.user.id)
      );

      if (!friendship) return null;
      const friend = friendship.requesterId === session.user.id ? friendship.addressee : friendship.requester;
      return friend.displayName ?? friend.username;
    })
    .filter((value): value is string => Boolean(value));

  if (requestedTagIds.length > 0 && taggedPeople.length !== requestedTagIds.length) {
    return NextResponse.json({ error: 'You can only tag accepted friends' }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, spotId: id },
    orderBy: { updatedAt: 'desc' },
  });

  const reviewData = {
    rating: Math.max(0, Math.min(10, numericRating)),
    spotType: body.spotType ?? null,
    reaction: body.reaction ?? null,
    goodFor: Array.isArray(body.goodFor) ? body.goodFor : [],
    taggedPeople,
    visitDate: body.visitDate ? new Date(body.visitDate) : null,
    text: String(body.text ?? ''),
    liked: body.liked ?? null,
    disliked: body.disliked ?? null,
    images: Array.isArray(body.images) ? body.images : [],
    helpfulBy: [],
  };

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: reviewData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      })
    : await prisma.review.create({
        data: {
          userId: session.user.id,
          spotId: spot.id,
          ...reviewData,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

  await prisma.userRating.upsert({
    where: {
      userId_spotId: {
        userId: session.user.id,
        spotId: id,
      },
    },
    update: { rating: reviewData.rating },
    create: {
      userId: session.user.id,
      spotId: id,
      rating: reviewData.rating,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
