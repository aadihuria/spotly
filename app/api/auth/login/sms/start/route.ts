import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  deliverSmsVerificationCode,
  generateVerificationCode,
  getDevPreviewCode,
  getVerificationExpiry,
  hashVerificationCode,
} from '@/lib/verification';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        passwordHash: true,
        phone: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Verify your email before using phone code login' }, { status: 403 });
    }

    if (!user.phone) {
      return NextResponse.json({ error: 'Add a phone number to your account before using phone verification' }, { status: 400 });
    }

    const code = generateVerificationCode();

    await prisma.verificationCode.deleteMany({
      where: {
        userId: user.id,
        type: 'sms_login',
        consumedAt: null,
      },
    });

    const challenge = await prisma.verificationCode.create({
      data: {
        userId: user.id,
        phone: user.phone,
        type: 'sms_login',
        codeHash: hashVerificationCode(code),
        expiresAt: getVerificationExpiry(),
      },
      select: { id: true },
    });

    await deliverSmsVerificationCode(user.phone, code);

    return NextResponse.json({
      challengeId: challenge.id,
      phoneLast4: user.phone.slice(-4),
      devCodePreview: getDevPreviewCode(code),
    });
  } catch (error) {
    console.error('SMS login start failed:', error);
    return NextResponse.json({ error: 'Could not send login code' }, { status: 500 });
  }
}
