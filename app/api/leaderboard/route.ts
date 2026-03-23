import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    include: { reviews: true, spotsUploaded: true, groupsCreated: true },
  });

  const leaderboard = users
    .map((u: { id: string; username: string; reviews: unknown[]; spotsUploaded: unknown[]; groupsCreated: unknown[] }) => ({
      userId: u.id,
      username: u.username,
      score: u.reviews.length * 10 + u.spotsUploaded.length * 15 + u.groupsCreated.length * 25,
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  return NextResponse.json({ leaderboard });
}
