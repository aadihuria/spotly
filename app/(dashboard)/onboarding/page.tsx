'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check } from 'lucide-react';

const INTEREST_OPTIONS = [
  // Academic
  { label: 'Computer Science', emoji: '💻' },
  { label: 'Data Science', emoji: '📊' },
  { label: 'Engineering', emoji: '⚙️' },
  { label: 'Pre-Med / Biology', emoji: '🧬' },
  { label: 'Business / Finance', emoji: '📈' },
  { label: 'Economics', emoji: '🏦' },
  { label: 'Law', emoji: '⚖️' },
  { label: 'Psychology', emoji: '🧠' },
  { label: 'Chemistry', emoji: '🧪' },
  { label: 'Physics', emoji: '⚛️' },
  { label: 'Mathematics', emoji: '📐' },
  { label: 'Political Science', emoji: '🏛️' },
  { label: 'Literature / Writing', emoji: '📖' },
  { label: 'History', emoji: '🏺' },
  { label: 'Art & Design', emoji: '🎨' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Film & Media', emoji: '🎬' },
  { label: 'Architecture', emoji: '🏗️' },
  { label: 'Environmental Science', emoji: '🌿' },
  { label: 'Neuroscience', emoji: '🧬' },
  { label: 'Public Health', emoji: '🏥' },
  { label: 'Sociology', emoji: '👥' },
  { label: 'Philosophy', emoji: '💭' },
  { label: 'Languages', emoji: '🌍' },
  // Study style
  { label: 'Quiet Study', emoji: '🤫' },
  { label: 'Group Study', emoji: '🤝' },
  { label: 'Coffee Lover', emoji: '☕' },
  { label: 'Night Owl', emoji: '🦉' },
  { label: 'Morning Person', emoji: '🌅' },
  { label: 'Outdoor Spaces', emoji: '🌳' },
  { label: 'Research', emoji: '🔬' },
  { label: 'Hackathons', emoji: '🚀' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);


  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  async function finish() {
    setSaving(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: Array.from(selected) }),
    });
    router.push('/dashboard');
  }

  return (
    <div className="screen-width page-padding space-y-6 pb-24">
      <div className="space-y-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:bg-slate-800 dark:text-blue-400">
            <Sparkles className="h-3 w-3" /> Personalized for you
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">What are you into?</h1>
        <p className="text-sm text-gray-500 dark:text-slate-300">
          Pick your interests so we can recommend the best study spots and groups for you.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {INTEREST_OPTIONS.map(({ label, emoji }) => {
          const active = selected.has(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                active
                  ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <span>{emoji}</span>
              {label}
              {active && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-md space-y-2">
          <button
            type="button"
            onClick={finish}
            disabled={saving || selected.size === 0}
            className="spotly-button-primary w-full disabled:opacity-40"
          >
            {saving ? 'Saving...' : selected.size === 0 ? 'Pick at least one interest' : `Continue with ${selected.size} interest${selected.size !== 1 ? 's' : ''}`}
          </button>
          <p className="text-center text-xs text-gray-400">You can update this anytime in your profile</p>
        </div>
      </div>
    </div>
  );
}
