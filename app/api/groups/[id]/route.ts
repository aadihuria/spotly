import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const group = await prisma.studyGroup.findUnique({ where: { id: params.id }, include: { members: true, messages: true } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ group });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const group = await prisma.studyGroup.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ group });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.studyGroup.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
