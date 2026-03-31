import { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-sm items-center">
        <div className="w-full rounded-2xl bg-white px-8 py-10 shadow-xl dark:bg-slate-900">
          <div className="space-y-2 text-center">
            <div className="text-3xl">🎓</div>
            <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-300">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
