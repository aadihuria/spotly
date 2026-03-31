import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  deliverEmailVerificationCode,
  generateVerificationCode,
  getDevPreviewCode,
  getVerificationExpiry,
  hashVerificationCode,
} from '@/lib/verification';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = String(body.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    const code = generateVerificationCode();

    await prisma.verificationCode.deleteMany({
      where: { email, type: 'email_signup', consumedAt: null },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        email,
        type: 'email_signup',
        codeHash: hashVerificationCode(code),
        expiresAt: getVerificationExpiry(),
      },
    });

    await deliverEmailVerificationCode(email, code);

    return NextResponse.json({ ok: true, devCodePreview: getDevPreviewCode(code) });
  } catch (error) {
    console.error('Email verification resend failed:', error);
    return NextResponse.json({ error: 'Could not send verification code' }, { status: 500 });
  }
}
