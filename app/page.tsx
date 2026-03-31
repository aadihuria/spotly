import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 text-center">
        <div className="space-y-3">
          <div className="text-4xl">🎓</div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] dark:text-white">Spotly</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">
            Discover the Best Study Spots on Campus
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600"
            alt="Student studying"
            width={600}
            height={420}
            className="h-56 w-full object-cover"
            priority
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">
            Find the Perfect Place to Study
          </h2>
          <div className="space-y-3">
            <Link href="/signup" className="spotly-button-primary block w-full">
              Get Started
            </Link>
            <Link href="/login" className="spotly-button-secondary block w-full">
              Log In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs text-gray-500 dark:text-slate-300">
          <div className="space-y-1">
            <div className="text-xl">📍</div>
            <p>Explore Spots</p>
          </div>
          <div className="space-y-1">
            <div className="text-xl">⭐</div>
            <p>Read Reviews</p>
          </div>
          <div className="space-y-1">
            <div className="text-xl">🔖</div>
            <p>Save Favorites</p>
          </div>
        </div>
      </div>
    </main>
  );
}
