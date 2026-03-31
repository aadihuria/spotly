import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const senderId = session.user.id;

  let conversationId = body.conversationId as string | undefined;
  const recipientId = typeof body.recipientId === 'string' ? body.recipientId : undefined;
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content && !body.imageUrl) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  if (!conversationId && recipientId) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: senderId, addresseeId: recipientId },
          { requesterId: recipientId, addresseeId: senderId },
        ],
      },
    });

    if (friendship) {
      const existing = await prisma.conversation.findFirst({
        where: {
          participants: { hasEvery: [senderId, recipientId] },
        },
      });
      if (existing) {
        conversationId = existing.id;
      } else {
        const newConv = await prisma.conversation.create({ data: { participants: [senderId, recipientId] } });
        conversationId = newConv.id;
      }
    } else {
      const existingRequest = await prisma.directMessageRequest.findFirst({
        where: {
          OR: [
            { requesterId: senderId, recipientId },
            { requesterId: recipientId, recipientId: senderId },
          ],
        },
      });

      if (existingRequest?.status === 'accepted') {
        if (existingRequest.conversationId) {
          conversationId = existingRequest.conversationId;
        } else {
          const existingConversation = await prisma.conversation.findFirst({
            where: {
              participants: { hasEvery: [senderId, recipientId] },
            },
          });
          if (existingConversation) {
            conversationId = existingConversation.id;
          } else {
            const conversation = await prisma.conversation.create({
              data: { participants: [senderId, recipientId] },
            });
            conversationId = conversation.id;
          }
          await prisma.directMessageRequest.update({
            where: { id: existingRequest.id },
            data: { conversationId },
          });
        }
      } else {
        const request = existingRequest
          ? await prisma.directMessageRequest.update({
              where: { id: existingRequest.id },
              data: {
                requesterId: senderId,
                recipientId,
                initialMessage: content,
                status: 'pending',
              },
            })
          : await prisma.directMessageRequest.create({
              data: { requesterId: senderId, recipientId, initialMessage: content, status: 'pending' },
            });

        return NextResponse.json({ requested: true, request }, { status: 202 });
      }
    }
  }

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation not available' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || !conversation.participants.includes(senderId)) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      recipientId,
      conversationId,
      content,
      imageUrl: body.imageUrl,
      type: body.imageUrl ? 'image' : 'text',
      readBy: [senderId],
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  if (conversationId && process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.PUSHER_SECRET) {
    try {
      await pusherServer.trigger(`conversation-${conversationId}`, 'new-message', message);
    } catch (error) {
      console.error('Pusher conversation trigger failed:', error);
    }
  }
  return NextResponse.json({ message }, { status: 201 });
}
