import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ProfileNotificationsPage() {
  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Notifications</h1>
      </div>

      <div className="space-y-3">
        {[
          'Your saved spot updated its hours',
          'A friend reviewed North Quad Study Lounges',
          'Your group posted a new shared spot',
        ].map((item) => (
          <div key={item} className="rounded-2xl bg-[#F3F4F6] px-4 py-4 shadow-md dark:bg-slate-800">
            <p className="text-sm text-gray-600 dark:text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
