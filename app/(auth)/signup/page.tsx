import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your Spotly account"
      subtitle="Join your campus community and start building your go-to study routine."
    >
      <SignupForm />
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-300">
        Already have an account?{' '}
        <Link className="font-semibold text-[#2563EB]" href="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
