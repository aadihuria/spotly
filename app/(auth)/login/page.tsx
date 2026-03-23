import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your study streak.">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-white/70">
        New here? <Link className="gradient-text" href="/signup">Create account</Link>
      </p>
    </AuthLayout>
  );
}
