'use client';

import { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneChallengeId, setPhoneChallengeId] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneLast4, setPhoneLast4] = useState<string | null>(null);
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ← critical
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget); // ← get data from the event
    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') ? 'true' : 'false',
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password.'
            : result.error === 'Please verify your email before signing in'
              ? 'Verify your email first, then try logging in again.'
              : result.error === 'Invalid phone verification code'
                ? 'That 6-digit phone code is invalid.'
                : result.error === 'Your phone verification code has expired'
                  ? 'That phone verification code expired. Request a new one.'
                  : result.error === 'Invalid or expired phone verification attempt'
                    ? 'Start the phone verification flow again.'
                    : result.error === 'Invalid email or password'
                      ? 'Invalid email or password.'
                      : 'Could not sign in. Please try again.'
        );
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function startPhoneVerification() {
    setLoading(true);
    setError(null);

    const form = formRef.current;
    if (!form) {
      setError('Could not read your login form.');
      setLoading(false);
      return;
    }

    const formData = new FormData(form);

    try {
      const res = await fetch('/api/auth/login/sms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        challengeId?: string;
        phoneLast4?: string;
        devCodePreview?: string;
      };

      if (!res.ok || !data.challengeId) {
        setError(data.error ?? 'Could not send phone verification code.');
        return;
      }

      setPhoneChallengeId(data.challengeId);
      setPhoneLast4(data.phoneLast4 ?? null);
      setDevCodePreview(data.devCodePreview ?? null);
    } catch {
      setError('Could not send phone verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyPhoneCode() {
    if (!phoneChallengeId || !phoneCode) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        challengeId: phoneChallengeId,
        code: phoneCode,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid verification code.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Could not verify phone code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (phoneChallengeId) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#1E3A5F]">Enter your text code</h3>
          <p className="text-sm text-gray-500">
            We sent a 6-digit code to the phone number ending in {phoneLast4 ?? 'your phone'}.
          </p>
          {devCodePreview ? (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Dev preview code: <span className="font-semibold">{devCodePreview}</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="login-phone-code" className="text-sm font-semibold text-[#1E3A5F]">
            6-digit code
          </label>
          <input
            id="login-phone-code"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button type="button" onClick={verifyPhoneCode} disabled={loading} className="spotly-button-primary w-full">
          {loading ? 'Verifying...' : 'Verify & Log In'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setPhoneChallengeId(null);
            setPhoneCode('');
            setPhoneLast4(null);
            setDevCodePreview(null);
          }}
          className="spotly-button-secondary w-full"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-semibold text-[#1E3A5F]">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          placeholder="you@example.edu"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-semibold text-[#1E3A5F]">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          placeholder="Enter your password"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[#1E3A5F] outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <input name="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-blue-500" /> Remember me on this device
      </label>
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="spotly-button-primary w-full">
        {loading ? 'Signing in...' : 'Log In'}
      </button>
      <button type="button" disabled={loading} onClick={() => void startPhoneVerification()} className="spotly-button-secondary w-full">
        Log In with 6-digit Text Code
      </button>
    </form>
  );
}
