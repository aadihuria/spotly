import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lists = await prisma.spotList.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          spot: {
            include: { images: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ lists });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? '').trim();

  if (!name) {
    return NextResponse.json({ error: 'List name is required' }, { status: 400 });
  }

  const list = await prisma.spotList.create({
    data: {
      userId: session.user.id,
      name,
    },
  });

  return NextResponse.json({ list }, { status: 201 });
}
