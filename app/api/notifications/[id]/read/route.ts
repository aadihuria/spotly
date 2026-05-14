import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notification = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ notification });
}
