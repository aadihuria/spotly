import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout title="Create account" subtitle="Join your campus study community.">
      <SignupForm />
      <p className="mt-4 text-center text-sm text-white/70">
        Already have an account? <Link className="gradient-text" href="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
