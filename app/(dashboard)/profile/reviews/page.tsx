'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import { useUser } from '@/hooks/useUser';
import { Review } from '@/components/ReviewProvider';

export default function ProfileReviewsPage() {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      if (!user?.id) return;
      const res = await fetch(`/api/users/${user.id}/reviews`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = (await res.json()) as {
        reviews: Array<{
          id: string;
          rating: number;
          spotType: string | null;
          reaction: string | null;
          goodFor: string[];
          taggedPeople: string[];
          visitDate: string | null;
          text: string;
          liked: string | null;
          disliked: string | null;
          images: string[];
          createdAt: string;
          spot: { id: string; name: string; images: { url: string }[] };
        }>;
      };

      setReviews(
        data.reviews.map((review) => ({
          id: review.id,
          spotId: review.spot.id,
          spotName: review.spot.name,
          spotImage: review.spot.images[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
          userId: user.id,
          userName: user.name ?? user.email?.split('@')[0] ?? 'Spotly User',
          userInitial: (user.name ?? user.email?.[0] ?? 'S').toUpperCase(),
          rating: review.rating,
          spotType: (review.spotType as any) ?? 'Other',
          reaction: (review.reaction as any) ?? 'okay',
          goodFor: review.goodFor ?? [],
          taggedPeople: review.taggedPeople ?? [],
          visitDate: review.visitDate ? review.visitDate.slice(0, 10) : '',
          text: review.text,
          liked: review.liked ?? '',
          disliked: review.disliked ?? '',
          photos: review.images,
          date: new Date(review.createdAt).toLocaleDateString(),
          timestamp: new Date(review.createdAt).getTime(),
        }))
      );
      setLoading(false);
    }

    void loadReviews();
  }, [user?.email, user?.id, user?.name]);

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800">
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Your Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">Every rating you’ve posted on Spotly.</p>
        </div>
      </div>

      {loading ? (
        <div className="spotly-skeleton h-56" />
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-500 shadow-md dark:bg-slate-800 dark:text-slate-300">
          You haven’t posted any ratings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} showSpot />
          ))}
        </div>
      )}
    </div>
  );
}
