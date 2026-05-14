'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

type UserProfile = {
  displayName: string | null;
  bio: string | null;
  major: string | null;
  graduationYear: number | null;
  instagram: string | null;
  snapchat: string | null;
  username: string;
  email: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    major: '',
    graduationYear: '',
    instagram: '',
    snapchat: '',
  });

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(({ user }: { user: UserProfile }) => {
        setForm({
          displayName: user.displayName ?? '',
          bio: user.bio ?? '',
          major: user.major ?? '',
          graduationYear: user.graduationYear ? String(user.graduationYear) : '',
          instagram: user.instagram ?? '',
          snapchat: user.snapchat ?? '',
        });
        setLoading(false);
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: form.displayName,
        bio: form.bio,
        major: form.major,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        instagram: form.instagram,
        snapchat: form.snapchat,
      }),
    });

    setSaving(false);
    if (res.ok) {
      toast.success('Profile updated');
      router.push('/profile');
    } else {
      toast.error('Failed to save changes');
    }
  }

  if (loading) return <div className="screen-width page-padding"><div className="spotly-skeleton h-96 rounded-2xl" /></div>;

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Edit Profile</h1>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Basic Info</p>
          </div>
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-slate-800">
            {[
              { name: 'displayName', label: 'Display Name', placeholder: 'Your name', type: 'input' },
              { name: 'major', label: 'Major', placeholder: 'e.g. Computer Science', type: 'input' },
              { name: 'graduationYear', label: 'Graduation Year', placeholder: 'e.g. 2026', type: 'number' },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <span className="w-32 shrink-0 text-sm text-gray-500 dark:text-slate-400">{label}</span>
                <input
                  name={name}
                  type={type === 'number' ? 'number' : 'text'}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm font-medium text-[#1E3A5F] outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Bio</p>
          </div>
          <div className="px-4 py-3">
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-[#1E3A5F] outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Social</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {[
              { name: 'instagram', label: 'Instagram', placeholder: '@username' },
              { name: 'snapchat', label: 'Snapchat', placeholder: 'username' },
            ].map(({ name, label, placeholder }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <span className="w-24 shrink-0 text-sm text-gray-500 dark:text-slate-400">{label}</span>
                <input
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm font-medium text-[#1E3A5F] outline-none placeholder:text-gray-300 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="spotly-button-primary w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
