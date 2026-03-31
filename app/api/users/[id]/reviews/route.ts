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

  const reviews = await prisma.review.findMany({
    where: { userId: id },
    include: {
      spot: {
        include: { images: true },
      },
    },
    orderBy: [{ rating: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ reviews });
}
