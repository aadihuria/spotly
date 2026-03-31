import { SpotCard } from './SpotCard';

type SpotGridSpot = {
  id: string;
  name: string;
  image_url?: string;
  image?: string;
  rating: number;
  address?: string;
  location?: string;
  tags?: string[];
};

export function SpotGrid({ spots }: { spots: SpotGridSpot[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} className="w-full" />
      ))}
    </div>
  );
}
