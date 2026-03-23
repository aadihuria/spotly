import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const members = await prisma.groupMember.findMany({ where: { groupId: params.id } });
  return NextResponse.json({ members });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const member = await prisma.groupMember.create({ data: { groupId: params.id, userId: body.userId, role: body.role ?? 'member' } });
  return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  await prisma.groupMember.delete({ where: { groupId_userId: { groupId: params.id, userId } } });
  return NextResponse.json({ ok: true });
}
