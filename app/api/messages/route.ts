import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const conversations = await prisma.conversation.findMany({
    where: { participants: { has: session.user.id } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ conversations });
}
