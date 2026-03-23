import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({ where: { spotId: params.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ reviews });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      spotId: params.id,
      rating: body.rating,
      text: body.text,
      images: body.images ?? [],
      helpfulBy: [],
    },
  });
  return NextResponse.json({ review }, { status: 201 });
}
