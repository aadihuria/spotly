'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      email: formData.get('email'),
      username: formData.get('username'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      university: formData.get('university'),
    };

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const contentType = res.headers.get('content-type') ?? '';
      let message = 'Could not create account';

      if (contentType.includes('application/json')) {
        try {
          const data = (await res.json()) as { error?: string };
          message = data.error ?? message;
        } catch {
          // Ignore JSON parsing errors and keep fallback message.
        }
      } else {
        const raw = (await res.text()).trim();
        if (raw) {
          message = raw;
        }
      }

      setError(message);
      return;
    }

    router.push('/login');
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input name="email" required type="email" placeholder="Email" className="w-full rounded-xl border border-white/20 bg-white/10 p-3" />
      <input name="username" required placeholder="Username" className="w-full rounded-xl border border-white/20 bg-white/10 p-3" />
      <input name="university" required placeholder="University" className="w-full rounded-xl border border-white/20 bg-white/10 p-3" />
      <input name="password" required type="password" placeholder="Password" className="w-full rounded-xl border border-white/20 bg-white/10 p-3" />
      <input name="confirmPassword" required type="password" placeholder="Confirm password" className="w-full rounded-xl border border-white/20 bg-white/10 p-3" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-glow w-full disabled:opacity-60">{loading ? 'Creating...' : 'Create account'}</button>
    </form>
  );
}
