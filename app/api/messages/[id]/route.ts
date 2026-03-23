import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const messages = await prisma.message.findMany({ where: { conversationId: params.id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ messages });
}
