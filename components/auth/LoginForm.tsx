'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') ? 'true' : 'false',
      redirect: false,
    });

    setLoading(false);
    if (!result?.error) router.push('/dashboard');
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input name="email" type="email" required className="w-full rounded-xl border border-white/20 bg-white/10 p-3" placeholder="you@university.edu" />
      <input name="password" type="password" required className="w-full rounded-xl border border-white/20 bg-white/10 p-3" placeholder="Password" />
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input name="remember" type="checkbox" /> Remember me
      </label>
      <button type="submit" disabled={loading} className="btn-glow w-full disabled:opacity-60">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
