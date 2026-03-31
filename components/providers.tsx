'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { ReviewProvider } from '@/components/ReviewProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReviewProvider>
        {children}
        <Toaster richColors position="top-right" />
      </ReviewProvider>
    </SessionProvider>
  );
}
