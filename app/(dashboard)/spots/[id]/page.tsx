import { SpotImageGallery } from '@/components/spots/SpotImageGallery';

export default function SpotDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h1 className="text-2xl font-bold">Spot #{params.id}</h1>
        <p className="text-sm text-white/70">Real-time occupancy: Moderate</p>
        <button className="btn-glow mt-3">Check In</button>
      </div>
      <SpotImageGallery images={['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800']} />
      <div className="glass rounded-2xl p-4">Reviews and group activity appear here.</div>
    </section>
  );
}
