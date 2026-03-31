import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashVerificationCode, isVerificationCodeExpired } from '@/lib/verification';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; code?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const code = String(body.code ?? '').trim();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        type: 'email_signup',
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 404 });
    }

    if (isVerificationCodeExpired(verification.expiresAt)) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    const codeHash = hashVerificationCode(code);
    if (verification.codeHash !== codeHash) {
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verification.id },
        data: { consumedAt: now },
      }),
      prisma.user.update({
        where: { id: verification.userId ?? verification.user?.id },
        data: { emailVerifiedAt: now },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Email verification confirm failed:', error);
    return NextResponse.json({ error: 'Could not verify email' }, { status: 500 });
  }
}
