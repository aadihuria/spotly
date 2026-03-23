import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const signupSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    university: z.string().min(2),
  })
  .refine((v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldMessage = Object.values(flattened.fieldErrors)
      .flat()
      .find((msg): msg is string => typeof msg === 'string' && msg.length > 0);
    const message = fieldMessage ?? flattened.formErrors[0] ?? 'Invalid signup data';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
  });

  if (exists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      university: parsed.data.university,
      passwordHash,
      interests: [],
    },
    select: { id: true, email: true, username: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
