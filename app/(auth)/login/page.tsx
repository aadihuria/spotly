import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back to Spotly"
      subtitle="Log in to keep discovering, saving, and reviewing your favorite study spots."
    >
      <LoginForm />
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-300">
        New here?{' '}
        <Link className="font-semibold text-[#2563EB]" href="/signup">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
