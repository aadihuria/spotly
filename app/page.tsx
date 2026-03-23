import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-grid p-8 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="glass rounded-full px-4 py-2 text-sm">Beli meets Discord for students</p>
        <h1 className="gradient-text text-5xl font-bold md:text-7xl">StudySpot</h1>
        <p className="max-w-2xl text-muted-foreground">
          Discover the best study spots, connect with course groups, and chat with friends in real-time.
        </p>
        <div className="flex gap-3">
          <Link href="/signup" className="btn-glow">Get Started</Link>
          <Link href="/login" className="rounded-xl border border-white/20 px-5 py-3">Login</Link>
        </div>
      </div>
    </main>
  );
}
