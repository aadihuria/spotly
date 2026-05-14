import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const user = await prisma.user.update({ where: { id }, data: { avatar: body.url } });
  return NextResponse.json({ user });
}
