import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const spot = await prisma.studySpot.findUnique({ where: { id: params.id }, include: { images: true, reviews: true } });
  if (!spot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ spot });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const spot = await prisma.studySpot.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ spot });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.studySpot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
