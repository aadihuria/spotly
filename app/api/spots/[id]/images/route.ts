import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const image = await prisma.spotImage.create({
    data: { spotId: params.id, uploadedById: session.user.id, url: body.url, caption: body.caption },
  });
  return NextResponse.json({ image }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'Missing imageId' }, { status: 400 });
  await prisma.spotImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
