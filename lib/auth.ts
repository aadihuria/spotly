import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession as nextAuthGetServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashVerificationCode, isVerificationCodeExpired } from '@/lib/verification';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        challengeId: { label: 'Challenge ID', type: 'text' },
        code: { label: 'Code', type: 'text' },
        remember: { label: 'Remember me', type: 'checkbox' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (credentials?.challengeId && credentials?.code) {
          const challenge = await prisma.verificationCode.findUnique({
            where: { id: credentials.challengeId },
            include: { user: true },
          });
          if (!challenge || challenge.type !== 'sms_login' || challenge.consumedAt || !challenge.user) {
            throw new Error('Invalid or expired phone verification attempt');
          }
          if (isVerificationCodeExpired(challenge.expiresAt)) {
            throw new Error('Your phone verification code has expired');
          }
          if (challenge.codeHash !== hashVerificationCode(credentials.code)) {
            await prisma.verificationCode.update({
              where: { id: challenge.id },
              data: { attempts: { increment: 1 } },
            });
            throw new Error('Invalid phone verification code');
          }

          const now = new Date();
          await prisma.$transaction([
            prisma.verificationCode.update({
              where: { id: challenge.id },
              data: { consumedAt: now },
            }),
            prisma.user.update({
              where: { id: challenge.user.id },
              data: { phoneVerifiedAt: challenge.user.phoneVerifiedAt ?? now },
            }),
          ]);

          return {
            id: challenge.user.id,
            email: challenge.user.email,
            name: challenge.user.displayName ?? challenge.user.username,
            image: challenge.user.avatar ?? undefined,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.emailVerifiedAt) {
          throw new Error('Please verify your email before signing in');
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          image: user.avatar ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: { id?: string } | null }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }: { session: { user?: { id?: string } }; token: Record<string, unknown> }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
};

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session;
}
