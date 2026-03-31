'use client';

import { useEffect, useState } from 'react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div className="glass mx-auto mt-20 max-w-xl rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="Search spots, groups, messages..." className="w-full rounded-lg bg-white/10 p-3" />
      </div>
    </div>
  );
}
