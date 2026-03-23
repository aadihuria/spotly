'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function normalizeErrorMessage(input: unknown): string {
    if (typeof input === 'string' && input.trim()) return input;
    if (Array.isArray(input)) {
      const firstString = input.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
      if (firstString) return firstString;
    }
    if (input && typeof input === 'object') {
      const record = input as Record<string, unknown>;
      if (Array.isArray(record.formErrors)) {
        const firstFormError = record.formErrors.find(
          (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );
        if (firstFormError) return firstFormError;
      }
      if (record.fieldErrors && typeof record.fieldErrors === 'object') {
        for (const value of Object.values(record.fieldErrors as Record<string, unknown>)) {
          if (Array.isArray(value)) {
            const firstFieldError = value.find(
              (item): item is string => typeof item === 'string' && item.trim().length > 0,
            );
            if (firstFieldError) return firstFieldError;
          }
        }
      }
      try {
        return JSON.stringify(input);
      } catch {
        return 'Could not create account';
      }
    }
    return 'Could not create account';
  }

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
          const data = (await res.json()) as { error?: unknown };
          message = normalizeErrorMessage(data.error);
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
