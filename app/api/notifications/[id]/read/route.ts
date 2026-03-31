import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const notification = await prisma.notification.update({
    where: { id: params.id },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ notification });
}
