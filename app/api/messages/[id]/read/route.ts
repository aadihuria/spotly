import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const message = await prisma.message.findUnique({ where: { id: params.id } });
  if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.message.update({
    where: { id: params.id },
    data: { readBy: Array.from(new Set([...message.readBy, session.user.id])) },
  });

  return NextResponse.json({ message: updated });
}
