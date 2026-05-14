'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ChevronLeft, Moon, Sun, Monitor, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Appearance</p>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4">
            {themes.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${
                    active
                      ? 'border-[#2563EB] bg-blue-50 dark:bg-slate-800'
                      : 'border-gray-100 bg-gray-50 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-[#2563EB]' : 'text-gray-400 dark:text-slate-400'}`} />
                  <span className={`text-xs font-semibold ${active ? 'text-[#2563EB]' : 'text-gray-500 dark:text-slate-400'}`}>
                    {label}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-[#2563EB]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Account</p>
          </div>
          <Link href="/profile/edit" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800">
            <span className="font-medium text-[#1E3A5F] dark:text-white">Edit Profile</span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
          </Link>
          <div className="border-t border-gray-100 dark:border-slate-800">
            <Link href="/profile/notifications" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800">
              <span className="font-medium text-[#1E3A5F] dark:text-white">Notifications</span>
              <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
