import { AddSpotWizard } from '@/components/spots/AddSpotWizard';

export default function NewSpotPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Create New Study Spot</h1>
      <AddSpotWizard />
    </section>
  );
}
