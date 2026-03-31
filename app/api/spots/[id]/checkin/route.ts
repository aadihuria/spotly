import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const checkIn = await prisma.spotCheckIn.create({ data: { userId: session.user.id, spotId: params.id } });
  return NextResponse.json({ checkIn });
}
