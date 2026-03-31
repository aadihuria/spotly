'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SpotGrid } from '@/components/spots/SpotGrid';

type ListDetail = {
  id: string;
  name: string;
  items: {
    id: string;
    spot: {
      id: string;
      name: string;
      address: string;
      images?: { url: string }[];
      reviews?: { rating: number }[];
      tags?: string[];
      location?: string;
    };
  }[];
};

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const [list, setList] = useState<ListDetail | null>(null);

  useEffect(() => {
    async function loadList() {
      const res = await fetch(`/api/lists/${params.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { list: ListDetail };
      setList(data.list);
    }

    if (params.id) {
      void loadList();
    }
  }, [params.id]);

  const spots = (list?.items ?? []).map((item) => ({
    id: item.spot.id,
    name: item.spot.name,
    address: item.spot.address,
    image: item.spot.images?.[0]?.url,
    rating:
      item.spot.reviews && item.spot.reviews.length > 0
        ? Number((item.spot.reviews.reduce((sum, review) => sum + review.rating, 0) / item.spot.reviews.length).toFixed(1))
        : 0,
    tags: item.spot.tags ?? [],
    location: item.spot.location ?? item.spot.address,
  }));

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/lists"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{list?.name ?? 'List'}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">{spots.length} saved spots</p>
        </div>
      </div>

      <SpotGrid spots={spots} />
    </div>
  );
}
