import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

type Period = 'weekly' | 'monthly' | 'all';

function getWindowStart(period: Period) {
  const now = new Date();
  if (period === 'weekly') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === 'monthly') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return null;
}

function isWithinWindow(date: Date, start: Date | null) {
  return start ? date >= start : true;
}

export async function GET(req: Request) {
  const session = await getServerSession();
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get('period');
  const period: Period =
    periodParam === 'weekly' || periodParam === 'monthly' || periodParam === 'all' ? periodParam : 'weekly';
  const windowStart = getWindowStart(period);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      reviews: {
        select: {
          rating: true,
          createdAt: true,
        },
      },
      spotsUploaded: {
        select: {
          createdAt: true,
          verified: true,
        },
      },
      groupsCreated: {
        select: {
          createdAt: true,
        },
      },
      sentFriendships: {
        where: { status: 'accepted' },
        select: { createdAt: true },
      },
      receivedFriendships: {
        where: { status: 'accepted' },
        select: { createdAt: true },
      },
    },
  });

  const leaderboard = users
    .map((user) => {
      const reviews = user.reviews.filter((review) => isWithinWindow(review.createdAt, windowStart));
      const spotsUploaded = user.spotsUploaded.filter((spot) => isWithinWindow(spot.createdAt, windowStart));
      const groupsCreated = user.groupsCreated.filter((group) => isWithinWindow(group.createdAt, windowStart));
      const friendsMade = [...user.sentFriendships, ...user.receivedFriendships].filter((friendship) =>
        isWithinWindow(friendship.createdAt, windowStart),
      );

      const averageRating = reviews.length
        ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
        : 0;
      const verifiedSpotCount = spotsUploaded.filter((spot) => spot.verified).length;
      const normalizedSpotCount = Math.min(spotsUploaded.length, 5);
      const normalizedVerifiedSpotCount = Math.min(verifiedSpotCount, 5);
      const score =
        reviews.length * 20 +
        Math.round(averageRating * 2) +
        normalizedSpotCount * 18 +
        normalizedVerifiedSpotCount * 4 +
        groupsCreated.length * 35 +
        friendsMade.length * 8;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        reviewCount: reviews.length,
        averageRating,
        spotCount: spotsUploaded.length,
        groupCount: groupsCreated.length,
        friendCount: friendsMade.length,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.averageRating - a.averageRating;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.userId === session?.user?.id,
    }));

  return NextResponse.json({
    leaderboard,
    period,
    currentUserId: session?.user?.id ?? null,
  });
}
