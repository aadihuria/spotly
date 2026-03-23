import { SpotCard } from './SpotCard';

export function SpotGrid({ spots }: { spots: { id: string; name: string; rating: number; tags: string[] }[] }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} />)}</div>;
}
