'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import ReviewCard from '@/components/ReviewCard';
import { useUser } from '@/hooks/useUser';

type PublicReview = {
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
};

type PublicProfile = {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  university: string;
  major?: string | null;
  graduationYear?: number | null;
  interests: string[];
  friendCount: number;
  reviewCount: number;
  conversationId?: string | null;
  friendship?: { id: string; status: string; incoming: boolean } | null;
  reviews: PublicReview[];
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const { user } = useUser();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`/api/users/profile/${params.username}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { user: PublicProfile };
      setProfile(data.user);
      setLoading(false);
    }

    if (params.username) {
      void loadProfile();
    }
  }, [params.username]);

  async function addFriend() {
    if (!profile) return;
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not send friend request');
      return;
    }
    toast.success('Friend request sent');
    setProfile((current) =>
      current
        ? {
            ...current,
            friendship: { id: current.friendship?.id ?? 'pending', status: 'pending', incoming: false },
          }
        : current
    );
  }

  async function acceptFriend() {
    if (!profile?.friendship?.id) return;
    const res = await fetch(`/api/friends/${profile.friendship.id}/accept`, { method: 'POST' });
    if (!res.ok) {
      toast.error('Could not accept friend request');
      return;
    }
    toast.success('Friend added');
    setProfile((current) =>
      current
        ? {
            ...current,
            friendship: { ...current.friendship!, status: 'accepted', incoming: false },
            friendCount: current.friendCount + 1,
          }
        : current
    );
  }

  if (loading) {
    return <div className="screen-width page-padding"><div className="spotly-skeleton h-64" /></div>;
  }

  if (!profile) {
    return <div className="screen-width page-padding text-sm text-gray-500">Profile not found.</div>;
  }

  const isCurrentUser = profile.id === user?.id;

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="rounded-2xl bg-[#F3F4F6] p-5 shadow-md dark:bg-slate-800">
        <div className="flex items-start gap-4">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.displayName ?? profile.username} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2563EB] text-2xl font-bold text-white">
              {(profile.displayName ?? profile.username)[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">{profile.displayName ?? profile.username}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-300">@{profile.username}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              {[profile.university, profile.major, profile.graduationYear ? `Class of ${profile.graduationYear}` : null].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {profile.bio ? <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">{profile.bio}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [profile.reviewCount, 'Ratings'],
            [profile.friendCount, 'Friends'],
            [profile.interests.length, 'Interests'],
            [profile.reviews[0]?.rating ?? '-', 'Top score'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-white px-3 py-3 text-center dark:bg-slate-900">
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-white">{String(value)}</p>
              <p className="text-xs text-gray-500 dark:text-slate-300">{label}</p>
            </div>
          ))}
        </div>

        {isCurrentUser ? (
          <div className="mt-4 flex gap-3">
            <Link href="/profile" className="spotly-button-primary flex flex-1 items-center justify-center gap-2">
              View your profile
            </Link>
            <Link href="/profile/settings" className="spotly-button-secondary flex flex-1 items-center justify-center gap-2">
              Edit settings
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            {profile.friendship?.status === 'accepted' ? (
              <Link href={`/messages?user=${profile.id}`} className="spotly-button-primary flex flex-1 items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                DM
              </Link>
            ) : profile.friendship?.status === 'pending' && profile.friendship.incoming ? (
              <button type="button" onClick={acceptFriend} className="spotly-button-primary flex flex-1 items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Accept Friend Request
              </button>
            ) : profile.friendship?.status === 'pending' ? (
              <button type="button" disabled className="spotly-button-secondary flex-1 opacity-60">
                Friend Request Sent
              </button>
            ) : (
              <button type="button" onClick={addFriend} className="spotly-button-primary flex flex-1 items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Friend
              </button>
            )}

            {profile.friendship?.status === 'accepted' ? (
              <Link href={`/messages?user=${profile.id}`} className="spotly-button-secondary flex flex-1 items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Link>
            ) : (
              <Link href={`/messages?user=${profile.id}`} className="spotly-button-secondary flex flex-1 items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Request DM
              </Link>
            )}
          </div>
        )}

        {profile.interests.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563EB] dark:bg-slate-900">
                {interest}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Ratings</h2>
          <p className="text-sm text-gray-500 dark:text-slate-300">Sorted by score</p>
        </div>

        {profile.reviews.length === 0 ? (
          <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-500 shadow-md dark:bg-slate-800 dark:text-slate-300">
            No ratings yet.
          </div>
        ) : (
          profile.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              showSpot
              review={{
                id: review.id,
                spotId: review.spot.id,
                spotName: review.spot.name,
                spotImage: review.spot.images[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
                userId: profile.id,
                userName: profile.displayName ?? profile.username,
                userInitial: (profile.displayName ?? profile.username)[0]?.toUpperCase() ?? 'S',
                profileHref: `/profile/${profile.username}`,
                rating: review.rating,
                spotType: (review.spotType as any) ?? 'Other',
                reaction: (review.reaction as any) ?? 'okay',
                goodFor: review.goodFor,
                taggedPeople: review.taggedPeople,
                visitDate: review.visitDate ? review.visitDate.slice(0, 10) : '',
                text: review.text,
                liked: review.liked ?? '',
                disliked: review.disliked ?? '',
                photos: review.images,
                date: new Date(review.createdAt).toLocaleDateString(),
                timestamp: new Date(review.createdAt).getTime(),
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
