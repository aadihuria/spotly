'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock3, Heart, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import ReviewCard from '@/components/ReviewCard';
import WriteReview from '@/components/WriteReview';
import { Review } from '@/components/ReviewProvider';
import { ANN_ARBOR_SPOTS } from '@/data/spots';

type SpotRecord = {
  id: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  total_reviews: number;
  tags: string[];
  image: string;
  photos: string[];
  crowd_level: string;
  hours: string;
  reviews: {
    id: string;
    username: string;
    user: string;
    avatar?: string | null;
    rating: number;
    comment: string;
    liked?: string | null;
    disliked?: string | null;
    photos: string[];
    reaction?: string | null;
    spotType?: string | null;
    goodFor: string[];
    taggedPeople: string[];
    visitDate: string;
    date: string;
  }[];
};

type ListRecord = { id: string; name: string };
type ReviewSort = 'newest' | 'oldest' | 'highest' | 'critical';

function recalculateReviewSummary(reviews: SpotRecord['reviews']) {
  const total = reviews.length;
  const rating = total > 0 ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / total).toFixed(1)) : 0;
  return { rating, total };
}

export default function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [spot, setSpot] = useState<SpotRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [favoritesListId, setFavoritesListId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewSort, setReviewSort] = useState<ReviewSort>('newest');

  useEffect(() => {
    async function loadSpot() {
      const res = await fetch(`/api/spots/${id}`);
      if (res.ok) {
        const data = (await res.json()) as { spot: SpotRecord };
        setSpot(data.spot);
        setLoaded(true);
        return;
      }

      const fallback = ANN_ARBOR_SPOTS.find((item) => item.id === id);
      if (fallback) {
        setSpot({
          id: fallback.id,
          name: fallback.name,
          description: `${fallback.name} is one of the most reliable study spots on campus.`,
          address: fallback.address,
          rating: fallback.rating,
          total_reviews: fallback.total_reviews,
          tags: fallback.tags,
          image: fallback.image,
          photos: fallback.photos,
          crowd_level: fallback.crowd_level,
          hours: fallback.hours,
          reviews: [],
        });
      }
      setLoaded(true);
    }

    async function loadLists() {
      const res = await fetch('/api/lists');
      if (!res.ok) return;
      const data = (await res.json()) as { lists: { id: string; name: string; items?: Array<{ spot: { id: string } }> }[] };
      setLists(data.lists.map((list) => ({ id: list.id, name: list.name })));
      const favorites = data.lists.find((list) => list.name.toLowerCase() === 'favorites');
      setFavoritesListId(favorites?.id ?? null);
      setIsFavorite(Boolean(favorites?.items?.some((item) => item.spot.id === id)));
    }

    void loadSpot();
    void loadLists();
  }, [id]);

  const averageRating = useMemo(() => spot?.rating ?? 0, [spot]);
  const sortedReviews = useMemo(() => {
    if (!spot) return [];
    const reviews = [...spot.reviews];
    switch (reviewSort) {
      case 'oldest':
        return reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'highest':
        return reviews.sort((a, b) => b.rating - a.rating || new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'critical':
        return reviews.sort((a, b) => a.rating - b.rating || new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'newest':
      default:
        return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [spot, reviewSort]);

  if (loaded && !spot) {
    return <div className="screen-width page-padding text-sm text-gray-500">Spot not found.</div>;
  }
  if (!spot) return <div className="screen-width page-padding">Loading...</div>;
  const spotId = spot.id;

  async function saveToList(listId: string) {
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotId }),
    });

    if (!res.ok) {
      toast.error('Could not save to list');
      return;
    }

    toast.success('Saved to list');
    setShowSavePanel(false);
  }

  async function toggleFavorite() {
    if (!spot) return;
    let targetListId = favoritesListId;

    if (!targetListId) {
      const createRes = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Favorites' }),
      });

      if (!createRes.ok) {
        toast.error('Could not create Favorites');
        return;
      }

      const createData = (await createRes.json()) as { list: { id: string; name: string } };
      targetListId = createData.list.id;
      setFavoritesListId(targetListId);
      setLists((current) => [createData.list, ...current]);
    }

    if (isFavorite) {
      const res = await fetch(`/api/lists/${targetListId}/items?spotId=${encodeURIComponent(spotId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Could not remove from Favorites');
        return;
      }
      setIsFavorite(false);
      toast.success('Removed from Favorites');
      return;
    }

    await saveToList(targetListId);
    setIsFavorite(true);
  }

  async function createListAndSave() {
    if (!newListName.trim()) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newListName.trim() }),
    });

    if (!res.ok) {
      toast.error('Could not create list');
      return;
    }

    const data = (await res.json()) as { list: { id: string; name: string } };
    setLists((current) => [data.list, ...current]);
    setNewListName('');
    await saveToList(data.list.id);
  }

  function appendReview(review?: Review) {
    if (!review) {
      setShowReviewForm(false);
      return;
    }

    setSpot((current) => {
      if (!current) return current;

      const usernameFromProfile = review.profileHref?.split('/').pop() ?? current.reviews.find((item) => item.id === review.id)?.username ?? '';
      const nextReviews = [
        {
          id: review.id,
          username: usernameFromProfile,
          user: review.userName,
          rating: review.rating,
          comment: review.text,
          liked: review.liked,
          disliked: review.disliked,
          photos: review.photos,
          reaction: review.reaction,
          spotType: review.spotType,
          goodFor: review.goodFor,
          taggedPeople: review.taggedPeople,
          visitDate: review.visitDate,
          date: review.date,
        },
        ...current.reviews.filter((item) => item.id !== review.id),
      ];
      const summary = recalculateReviewSummary(nextReviews);

      return {
        ...current,
        rating: summary.rating,
        total_reviews: summary.total,
        reviews: nextReviews,
      };
    });
    setShowReviewForm(false);
  }

  return (
    <div className="min-h-screen bg-white pb-28 dark:bg-slate-950">
      <div className="relative h-64">
        <img src={spot.image} alt={spot.name} className="h-full w-full object-cover" />
        <Link href="/dashboard" className="absolute left-4 top-4 rounded-full bg-white p-2 shadow-md active:opacity-85">
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F]" />
        </Link>
      </div>

      <div className="relative z-10 -mt-6 rounded-t-[24px] bg-white px-5 pt-5 dark:bg-slate-950">
        <div className="mx-auto max-w-[430px] space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{spot.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-300">
                <MapPin className="h-4 w-4" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:text-[#2563EB] hover:underline"
                >
                  {spot.address}
                </a>
              </div>
            </div>
            <button type="button" onClick={toggleFavorite} className="rounded-full bg-gray-100 p-2 active:opacity-85 dark:bg-slate-800">
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#2563EB] text-[#2563EB]' : 'text-[#2563EB]'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-[#FACC15]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-4 w-4 ${index < Math.round(averageRating / 2) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-semibold text-[#2563EB]">{averageRating}</span>
            <button
              type="button"
              onClick={() => document.getElementById('ratings-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-500 underline-offset-2 hover:text-[#2563EB] hover:underline dark:text-slate-300"
            >
              {spot.total_reviews} ratings
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {spot.tags.slice(0, 8).map((tag, index) => (
              <span key={`${tag}-${index}`} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-800">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
            <Clock3 className="h-4 w-4 text-[#2563EB]" />
            <span>{spot.hours}</span>
          </div>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
            {spot.description}
          </p>

          {showSavePanel ? (
            <div className="space-y-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
              <h3 className="font-semibold text-[#1E3A5F] dark:text-white">Save to a list</h3>
              <div className="flex gap-2">
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Create new list"
                  className="spotly-input"
                />
                <button type="button" onClick={createListAndSave} className="spotly-button-secondary whitespace-nowrap">
                  Create
                </button>
              </div>
              <div className="space-y-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => saveToList(list.id)}
                    className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left dark:bg-slate-900"
                  >
                    <span className="font-medium text-[#1E3A5F] dark:text-white">{list.name}</span>
                    <span className="text-sm text-[#2563EB]">Save</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <section id="ratings-section" className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Ratings</h2>
              <div className="flex items-center gap-3">
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#1E3A5F] outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest rated</option>
                  <option value="critical">Most critical</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowReviewForm((current) => !current)}
                  className="text-sm font-semibold text-[#2563EB]"
                >
                  {showReviewForm ? 'Close' : 'Rate this spot'}
                </button>
              </div>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                No ratings yet. Be the first to add one.
              </div>
            ) : (
              sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    id: review.id,
                    spotId: spot.id,
                    spotName: spot.name,
                    spotImage: spot.image,
                    profileHref: `/profile/${review.username}`,
                    userId: review.user,
                    userName: review.user,
                    userInitial: review.user[0]?.toUpperCase() ?? 'S',
                    rating: review.rating,
                    spotType: (review.spotType as any) ?? 'Other',
                    reaction: (review.reaction as any) ?? 'okay',
                    goodFor: review.goodFor ?? [],
                    taggedPeople: review.taggedPeople ?? [],
                    visitDate: review.visitDate,
                    text: review.comment,
                    liked: review.liked ?? '',
                    disliked: review.disliked ?? '',
                    photos: review.photos,
                    date: review.date,
                    timestamp: Date.now(),
                  }}
                />
              ))
            )}
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-[430px] gap-3">
          <button type="button" onClick={() => setShowSavePanel((current) => !current)} className="spotly-button-primary flex-1">
            Save to List
          </button>
          <button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="spotly-button-secondary flex-1 border-[#2563EB]"
          >
            Rate This Spot
          </button>
        </div>
      </div>

      {showReviewForm ? (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white p-4 shadow-2xl dark:bg-slate-950">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gray-200 dark:bg-slate-700" />
            <div className="mx-auto mb-4 flex max-w-[430px] items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-300">Ranking and review</p>
                <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">{spot.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-semibold text-[#1E3A5F] dark:bg-slate-800 dark:text-white"
              >
                Close
              </button>
            </div>
            <div className="mx-auto max-w-[430px] pb-8">
              <WriteReview spot={spot as any} onSubmitted={appendReview} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
