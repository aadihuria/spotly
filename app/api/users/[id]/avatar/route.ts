import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const user = await prisma.user.update({ where: { id: params.id }, data: { avatar: body.url } });
  return NextResponse.json({ user });
}
