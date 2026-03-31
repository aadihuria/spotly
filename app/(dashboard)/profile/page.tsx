'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Bookmark,
  Camera,
  ChevronRight,
  Heart,
  Map,
  MessageSquare,
  Newspaper,
  Settings,
  Trophy,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewCard from '@/components/ReviewCard';
import { ImageUploader } from '@/components/spots/ImageUploader';
import { useUser } from '@/hooks/useUser';
import { Review } from '@/components/ReviewProvider';

const interests = ['Coffee ☕', 'Quiet 🤫', 'Libraries 📚', 'Cafes ☕', 'Outdoors 🌿', 'Night Owl 🦉', 'Group Study 👥', 'Solo Study 🎧'];

const menuItems = [
  ['Feed', '/dashboard', Newspaper],
  ['Your Lists', '/lists', Bookmark],
  ['Leaderboard', '/leaderboard', Trophy],
  ['Explore Map', '/dashboard', Map],
  ['Saved Spots', '/lists', Heart],
  ['Friends', '/friends', Users],
  ['Messages', '/messages', MessageSquare],
  ['Notifications', '/profile/notifications', Bell],
  ['Settings', '/profile/settings', Settings],
] as const;

type ProfilePayload = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  instagram?: string | null;
  snapchat?: string | null;
  interests?: string[];
  spotsUploaded?: Array<{
    id: string;
    name: string;
    address: string;
    images?: { url: string }[];
    reviews?: { rating: number }[];
  }>;
};

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [ratings, setRatings] = useState<Review[]>([]);
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee ☕', 'Quiet 🤫']);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [spotCount, setSpotCount] = useState(0);

  const username = useMemo(
    () => profile?.displayName || user?.name || profile?.username || user?.email?.split('@')[0] || 'spotly_user',
    [profile?.displayName, profile?.username, user?.email, user?.name]
  );
  const userId = user?.id;

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      const [profileRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/reviews`),
      ]);
      const [friendsRes, listsRes] = await Promise.all([fetch('/api/friends'), fetch('/api/lists')]);

      if (profileRes.ok) {
        const data = (await profileRes.json()) as { user: ProfilePayload };
        setProfile(data.user);
        setEmail(data.user.email ?? '');
        setPhone(data.user.phone ?? '');
        setInstagram(data.user.instagram ?? '');
        setSnapchat(data.user.snapchat ?? '');
        setSelectedInterests(data.user.interests ?? []);
        setAvatarPreview(data.user.avatar ?? null);
        setSpotCount(data.user.spotsUploaded?.length ?? 0);
      }

      if (reviewsRes.ok) {
        const data = (await reviewsRes.json()) as {
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
        setRatings(
          data.reviews.map((review) => ({
            id: review.id,
            spotId: review.spot.id,
            spotName: review.spot.name,
            spotImage: review.spot.images[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
            userId: userId,
            userName: username,
            userInitial: username[0]?.toUpperCase() ?? 'S',
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
      }

      if (friendsRes.ok) {
        const data = (await friendsRes.json()) as { friends: Array<{ id: string }> };
        setFriendCount(data.friends.length);
      }

      if (listsRes.ok) {
        const data = (await listsRes.json()) as { lists: Array<{ items: Array<{ id: string }> }> };
        setSavedCount(data.lists.reduce((sum, list) => sum + list.items.length, 0));
      }
    }

    void loadProfile();
  }, [userId, username]);

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((value) => value !== interest) : [...current, interest]
    );
  }

  async function saveProfile() {
    if (!userId) return;
    setSaving(true);

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        phone,
        instagram,
        snapchat,
        interests: selectedInterests,
        avatar: avatarPreview,
        displayName: username,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      toast.error('Could not save profile');
      return;
    }

    toast.success('Profile updated');
  }

  async function handleSignOut() {
    if (!window.confirm('Log out of Spotly?')) return;
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex justify-end">
        <Link
          href="/profile/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-800"
        >
          <Settings className="h-5 w-5 text-[#2563EB]" />
        </Link>
      </div>

      <section className="space-y-4 text-center">
        <div className="relative mx-auto h-20 w-20">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile" className="h-full w-full rounded-full border-4 border-[#2563EB] object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#2563EB] bg-blue-50 text-2xl font-bold text-[#2563EB] dark:bg-slate-800">
              {username[0]?.toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md">
            <Camera className="h-4 w-4" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-white">{username}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-300">@{profile?.username ?? username}</p>
        </div>
        <div className="grid grid-cols-4 gap-3 border-y border-gray-100 py-4 dark:border-slate-800">
        {[
            [String(spotCount), 'Spots', '/profile/spots'],
            [String(ratings.length), 'Reviews', '/profile/reviews'],
            [String(savedCount), 'Saved', '/lists'],
            [String(friendCount), 'Friends', '/friends'],
          ].map(([value, label, href]) => (
            <Link key={label} href={href} className="block rounded-xl px-2 py-1 transition hover:bg-[#F3F4F6] dark:hover:bg-slate-800">
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-300">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
        <h2 className="mb-4 text-base font-semibold text-[#1E3A5F] dark:text-white">Edit Profile</h2>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
            <p className="mb-2 text-sm font-medium text-[#1E3A5F] dark:text-white">Profile photo</p>
            <ImageUploader onUploaded={(url) => setAvatarPreview(url)} />
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
            <label className="mb-1 block text-xs font-semibold text-[#1E3A5F] dark:text-white">Email *</label>
            <div className="flex items-center gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
              <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ verified</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
            <label className="mb-1 block text-xs font-semibold text-[#1E3A5F] dark:text-white">Phone *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full bg-transparent text-sm outline-none dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
            <span>👻</span>
            <input
              value={snapchat}
              onChange={(e) => setSnapchat(e.target.value)}
              placeholder="@snapchat"
              className="w-full bg-transparent text-sm outline-none dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
            <span>📷</span>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@instagram"
              className="w-full bg-transparent text-sm outline-none dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#1E3A5F] dark:text-white">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      active
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-gray-300 bg-white text-gray-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving} className="spotly-button-primary w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
        {menuItems.map(([label, href, Icon], index) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 px-4 py-4 ${
              index !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-slate-800' : ''
            }`}
          >
            <Icon className="h-5 w-5 text-[#2563EB]" />
            <span className="flex-1 text-sm font-medium text-[#1E3A5F] dark:text-white">{label}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Your Rating List</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB] dark:bg-slate-800">
            {ratings.length} ratings
          </span>
        </div>
        {ratings.length === 0 ? (
          <div className="rounded-2xl bg-[#F3F4F6] p-4 text-sm text-gray-600 shadow-md dark:bg-slate-800 dark:text-slate-300">
            Once you rate spots, they’ll show up here with your 0-10 scores.
          </div>
        ) : (
          ratings.map((review) => <ReviewCard key={review.id} review={review} showSpot />)
        )}
      </section>

      <button onClick={handleSignOut} className="spotly-button-primary mt-4 w-full">
        Log Out
      </button>
    </div>
  );
}
