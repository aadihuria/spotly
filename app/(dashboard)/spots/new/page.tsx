import { Suspense } from 'react';
import { AddSpotWizard } from '@/components/spots/AddSpotWizard';

export default function NewSpotPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Suspense>
        <AddSpotWizard />
      </Suspense>
    </div>
  );
}
