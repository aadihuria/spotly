import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.directMessageRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  if (request.recipientId !== session.user.id && request.requesterId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.directMessageRequest.update({
    where: { id },
    data: { status: 'declined' },
  });

  return NextResponse.json({ request: updated });
}
