'use client';

import Link from 'next/link';
import { Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="glass sticky top-0 z-20 mx-2 mt-2 flex items-center gap-3 rounded-2xl px-4 py-3">
      <Link href="/dashboard" className="gradient-text text-xl font-bold">StudySpot</Link>
      <div className="ml-auto flex items-center gap-2">
        <button aria-label="Search" className="rounded-lg p-2 hover:bg-white/10"><Search size={18} /></button>
        <button aria-label="Toggle dark mode" onClick={() => setDark((v) => !v)} className="rounded-lg p-2 hover:bg-white/10">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
