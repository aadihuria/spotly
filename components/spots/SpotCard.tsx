'use client';

import Image from 'next/image';
import Link from 'next/link';

type SpotCardSpot = {
  id: string;
  name: string;
  image_url?: string;
  image?: string;
  rating: number;
  address?: string;
  location?: string;
  tags?: string[];
};

export function SpotCard({
  spot,
  className = '',
}: {
  spot: SpotCardSpot;
  className?: string;
}) {
  const imageSrc = spot.image_url || spot.image || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800';
  const subtitle = spot.address || spot.location || 'Popular campus study spot';
  const filledStars = Math.max(1, Math.min(5, Math.round(spot.rating)));

  return (
    <Link
      href={`/spots/${spot.id}`}
      className={`w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-md transition-transform hover:scale-[1.02] dark:bg-slate-900 ${className}`}
    >
      <div className="relative h-24 w-full bg-gray-200 dark:bg-slate-700">
        <Image src={imageSrc} alt={spot.name} fill className="object-cover" sizes="160px" />
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{spot.name}</p>
        <p className="truncate text-xs text-gray-500 dark:text-slate-300">{subtitle}</p>
        <div className="flex items-center gap-1 text-xs">
          <span className="tracking-tight text-[#FACC15]">
            {'★'.repeat(filledStars)}
            {'☆'.repeat(5 - filledStars)}
          </span>
          <span className="font-medium text-[#2563EB]">{spot.rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
