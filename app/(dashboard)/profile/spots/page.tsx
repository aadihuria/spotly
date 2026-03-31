'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SpotGrid } from '@/components/spots/SpotGrid';
import { useUser } from '@/hooks/useUser';

type UploadedSpot = {
  id: string;
  name: string;
  address: string;
  images?: { url: string }[];
  reviews?: { rating: number }[];
};

export default function ProfileSpotsPage() {
  const { user } = useUser();
  const [spots, setSpots] = useState<UploadedSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpots() {
      if (!user?.id) return;
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { user: { spotsUploaded?: UploadedSpot[] } };
      setSpots(data.user.spotsUploaded ?? []);
      setLoading(false);
    }

    void loadSpots();
  }, [user?.id]);

  const formatted = spots.map((spot) => ({
    id: spot.id,
    name: spot.name,
    image_url: spot.images?.[0]?.url,
    image: spot.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
    rating:
      spot.reviews && spot.reviews.length > 0
        ? Number((spot.reviews.reduce((sum, review) => sum + review.rating, 0) / spot.reviews.length).toFixed(1))
        : 0,
    address: spot.address,
    location: spot.address,
    tags: [],
  }));

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800">
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Your Spots</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">Places you’ve added to Spotly.</p>
        </div>
      </div>

      {loading ? (
        <div className="spotly-skeleton h-56" />
      ) : formatted.length === 0 ? (
        <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-500 shadow-md dark:bg-slate-800 dark:text-slate-300">
          You haven’t added any spots yet.
        </div>
      ) : (
        <SpotGrid spots={formatted} />
      )}
    </div>
  );
}
