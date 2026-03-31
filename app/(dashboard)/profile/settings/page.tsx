import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProfileSettingsPage() {
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
        {['Notifications', 'Privacy', 'Appearance', 'Account'].map((item, index, items) => (
          <div
            key={item}
            className={`flex items-center justify-between px-4 py-4 ${
              index !== items.length - 1 ? 'border-b border-gray-100 dark:border-slate-800' : ''
            }`}
          >
            <span className="font-medium text-[#1E3A5F] dark:text-white">{item}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
