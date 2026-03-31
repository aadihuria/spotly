import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  deliverEmailVerificationCode,
  generateVerificationCode,
  getDevPreviewCode,
  getVerificationExpiry,
  hashVerificationCode,
} from '@/lib/verification';

const signupSchema = z
  .object({
    email: z.string().email(),
    phone: z.string().min(10, 'Phone number is required'),
    username: z.string().min(3),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    university: z.string().min(2, 'University is required'),
  })
  .refine((v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Server misconfiguration: DATABASE_URL is missing' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerifiedAt: true,
      },
    });

    if (existingByEmail && !existingByEmail.emailVerifiedAt) {
      const code = generateVerificationCode();

      await prisma.verificationCode.deleteMany({
        where: {
          email: parsed.data.email,
          type: 'email_signup',
          consumedAt: null,
        },
      });

      await prisma.verificationCode.create({
        data: {
          userId: existingByEmail.id,
          email: existingByEmail.email,
          type: 'email_signup',
          codeHash: hashVerificationCode(code),
          expiresAt: getVerificationExpiry(),
        },
      });

      await deliverEmailVerificationCode(existingByEmail.email, code);

      return NextResponse.json(
        {
          user: existingByEmail,
          requiresEmailVerification: true,
          devCodePreview: getDevPreviewCode(code),
          message: 'Your account already exists but still needs email verification.',
        },
        { status: 200 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
      },
    });

    if (exists) {
      if (exists.email === parsed.data.email) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'That username is already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const code = generateVerificationCode();
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        phone: parsed.data.phone,
        username: parsed.data.username,
        university: parsed.data.university,
        passwordHash,
        interests: [],
      },
      select: { id: true, email: true, username: true },
    });

    await prisma.verificationCode.deleteMany({
      where: {
        email: parsed.data.email,
        type: 'email_signup',
        consumedAt: null,
      },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        email: user.email,
        type: 'email_signup',
        codeHash: hashVerificationCode(code),
        expiresAt: getVerificationExpiry(),
      },
    });

    await deliverEmailVerificationCode(user.email, code);

    return NextResponse.json(
      {
        user,
        requiresEmailVerification: true,
        devCodePreview: getDevPreviewCode(code),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
