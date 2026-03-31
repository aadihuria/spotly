'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function getResponseError(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  const body = await res.text();

  if (!body) {
    return `Request failed with status ${res.status}`;
  }

  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(body) as { error?: unknown };
      return data.error ?? `Request failed with status ${res.status}`;
    } catch {
      return `Request failed with status ${res.status}`;
    }
  }

  return body;
}

function getErrorMessages(error: unknown): string[] {
  if (!error) return [];
  if (typeof error === 'string') return [error];

  if (Array.isArray(error)) {
    return error.filter((value): value is string => typeof value === 'string');
  }

  if (typeof error === 'object') {
    const maybeFlattened = error as {
      formErrors?: unknown;
      fieldErrors?: Record<string, unknown>;
    };

    const formErrors = Array.isArray(maybeFlattened.formErrors)
      ? maybeFlattened.formErrors.filter((value): value is string => typeof value === 'string')
      : [];

    const fieldErrors = maybeFlattened.fieldErrors
      ? Object.values(maybeFlattened.fieldErrors).flatMap((value) =>
          Array.isArray(value)
            ? value.filter((item): item is string => typeof item === 'string')
            : typeof value === 'string'
              ? [value]
              : []
        )
      : [];

    const messages = [...formErrors, ...fieldErrors];
    if (messages.length > 0) return messages;
  }

  return ['Could not create account'];
}

export function SignupForm() {
  const [error, setError] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Step 1: Track client-side rendering
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);
  const router = useRouter();

  // Step 2: Use `useEffect` to ensure the component renders client-side
  useEffect(() => {
    setIsClient(true); // This will run only on the client
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ← critical
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget); // ← get data from the event
    const payload = {
      email: formData.get('email'),
      phone: formData.get('phone'),
      username: formData.get('username'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      university: formData.get('university'),
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const responseError = await getResponseError(res);
        setError(getErrorMessages(responseError));
        return;
      }

      const data = (await res.json()) as { requiresEmailVerification?: boolean; devCodePreview?: string };
      setVerificationEmail(String(payload.email ?? ''));
      setNeedsVerification(Boolean(data.requiresEmailVerification));
      setDevCodePreview(data.devCodePreview ?? null);
    } catch {
      setError(['Could not create account. Please try again.']);
    } finally {
      setLoading(false);
    }
  }

  async function confirmEmailCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });

      if (!res.ok) {
        const responseError = await getResponseError(res);
        setError(getErrorMessages(responseError));
        return;
      }

      router.push('/login');
    } catch {
      setError(['Could not verify your email. Please try again.']);
    } finally {
      setLoading(false);
    }
  }

  async function resendEmailCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-email/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });

      if (!res.ok) {
        const responseError = await getResponseError(res);
        setError(getErrorMessages(responseError));
        return;
      }

      const data = (await res.json()) as { devCodePreview?: string };
      setDevCodePreview(data.devCodePreview ?? null);
    } catch {
      setError(['Could not resend the verification code.']);
    } finally {
      setLoading(false);
    }
  }

  if (!isClient) {
    // Return a fallback or loading state while waiting for client-side rendering
    return null;
  }

  if (needsVerification) {
    return (
      <form onSubmit={confirmEmailCode} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#1E3A5F]">Check your email</h3>
          <p className="text-sm text-gray-500">
            We sent a 6-digit verification code to <span className="font-semibold text-[#1E3A5F]">{verificationEmail}</span>.
          </p>
          {devCodePreview ? (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Dev preview code: <span className="font-semibold">{devCodePreview}</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-email-code" className="text-sm font-semibold text-[#1E3A5F]">
            Verification code
          </label>
          <input
            id="signup-email-code"
            name="emailCode"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error?.map((message, index) => (
          <p key={`${message}-${index}`} className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </p>
        ))}

        <button type="submit" disabled={loading} className="spotly-button-primary w-full">
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        <button type="button" disabled={loading} onClick={resendEmailCode} className="spotly-button-secondary w-full">
          Resend code
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-semibold text-[#1E3A5F]">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          required
          type="email"
          placeholder="you@example.edu"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500">Use an email address you can access so you can confirm the 6-digit verification code.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="signup-username" className="text-sm font-semibold text-[#1E3A5F]">
            Username
          </label>
          <input
            id="signup-username"
            name="username"
            required
            placeholder="Joe329"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-university" className="text-sm font-semibold text-[#1E3A5F]">
            University
          </label>
          <input
            id="signup-university"
            name="university"
            required
            placeholder="University / College"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-phone" className="text-sm font-semibold text-[#1E3A5F]">
          Phone number
        </label>
        <input
          id="signup-phone"
          name="phone"
          required
          type="tel"
          inputMode="tel"
          placeholder="(734) 555-1234"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-semibold text-[#1E3A5F]">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          required
          type="password"
          placeholder="At least 8 characters"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="signup-confirm-password" className="text-sm font-semibold text-[#1E3A5F]">
          Confirm password
        </label>
        <input
          id="signup-confirm-password"
          name="confirmPassword"
          required
          type="password"
          placeholder="Repeat your password"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error?.map((message, index) => (
        <p key={`${message}-${index}`} className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      ))}

      <button type="submit" disabled={loading} className="spotly-button-primary w-full">
        {loading ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}
