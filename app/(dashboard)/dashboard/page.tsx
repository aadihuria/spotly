import Link from 'next/link';

const fakeSpots = [
  { id: '1', name: 'North Quad Atrium', rating: 4.7, occupancy: 'Moderate' },
  { id: '2', name: 'Law Library', rating: 4.9, occupancy: 'Busy' },
  { id: '3', name: 'Union Study Lounge', rating: 4.5, occupancy: 'Light' },
];

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h2 className="text-xl font-semibold">Discover</h2>
        <p className="text-sm text-white/70">Trending study spaces around campus.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fakeSpots.map((spot) => (
          <Link key={spot.id} href={`/spots/${spot.id}`} className="glass group rounded-2xl p-4 transition hover:-translate-y-1">
            <h3 className="font-semibold">{spot.name}</h3>
            <p className="text-sm text-white/70">Rating {spot.rating} · {spot.occupancy}</p>
          </Link>
        ))}
      </div>
      <Link href="/spots/new" className="btn-glow fixed bottom-24 right-4 lg:bottom-8">+ Add Spot</Link>
    </section>
  );
}
