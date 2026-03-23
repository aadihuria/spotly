import { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="bg-grid flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <h1 className="gradient-text text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
