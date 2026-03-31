import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { ensureStaticSpotExists } from '@/lib/static-spots';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const list = await prisma.spotList.findFirst({ where: { id, userId: session.user.id } });
  if (!list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  const body = await req.json();
  const spotId = String(body.spotId ?? '');
  if (!spotId) {
    return NextResponse.json({ error: 'spotId is required' }, { status: 400 });
  }

  const spot = await ensureStaticSpotExists(prisma, spotId, session.user.id);
  if (!spot) {
    return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
  }

  const item = await prisma.spotListItem.upsert({
    where: {
      listId_spotId: {
        listId: id,
        spotId: spot.id,
      },
    },
    update: {},
    create: {
      listId: id,
      spotId: spot.id,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const list = await prisma.spotList.findFirst({ where: { id, userId: session.user.id } });
  if (!list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const spotId = searchParams.get('spotId');
  if (!spotId) {
    return NextResponse.json({ error: 'spotId is required' }, { status: 400 });
  }

  await prisma.spotListItem.deleteMany({
    where: { listId: id, spotId },
  });

  return NextResponse.json({ ok: true });
}
