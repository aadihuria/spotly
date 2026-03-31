"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  MapPin,
  Search,
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { useReviews, Review, SpotReaction, SpotType } from "@/components/ReviewProvider";
import { Spot } from "@/types";

const SPOT_TYPES: SpotType[] = ["Building", "Coffee Shop", "Library", "Other"];
const GOOD_FOR_OPTIONS = [
  "Quiet",
  "Loud",
  "Collaborative",
  "Solo Study",
  "Group Study",
  "Coffee",
  "Long Sessions",
  "Quick Stop",
  "Night Study",
  "Natural Light",
  "WiFi",
  "Outlets",
];

const REACTIONS: {
  value: SpotReaction;
  label: string;
  subtitle: string;
  tone: string;
  dot: string;
  glow: string;
}[] = [
  {
    value: "liked",
    label: "I Liked it!",
    subtitle: "Would definitely come back",
    tone: "border-green-200 bg-green-50 text-green-700",
    dot: "bg-green-500",
    glow: "shadow-[0_12px_30px_rgba(34,197,94,0.18)]",
  },
  {
    value: "okay",
    label: "It's okay",
    subtitle: "Solid, but not a favorite",
    tone: "border-yellow-200 bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-400",
    glow: "shadow-[0_12px_30px_rgba(250,204,21,0.18)]",
  },
  {
    value: "disliked",
    label: "I didn't like it",
    subtitle: "Would probably choose somewhere else",
    tone: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    glow: "shadow-[0_12px_30px_rgba(239,68,68,0.18)]",
  },
];

function getRatingMood(rating: number) {
  if (rating >= 9) return { label: "Elite spot", description: "This is one of your top-tier study places." };
  if (rating >= 7) return { label: "Really solid", description: "A dependable pick you’d happily revisit." };
  if (rating >= 5) return { label: "Mixed bag", description: "Decent enough, but there are tradeoffs." };
  if (rating >= 3) return { label: "Below average", description: "Not terrible, but definitely not ideal." };
  return { label: "Skip it", description: "You’d probably tell friends to go somewhere else." };
}

export default function WriteReview({ spot, onSubmitted }: { spot: Spot; onSubmitted?: (review?: Review) => void }) {
  const { user } = useUser();
  const { addReview } = useReviews();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(8);
  const [spotType, setSpotType] = useState<SpotType | "">("");
  const [reaction, setReaction] = useState<SpotReaction | null>(null);
  const [goodFor, setGoodFor] = useState<string[]>([]);
  const [friendQuery, setFriendQuery] = useState("");
  const [friends, setFriends] = useState<Array<{ id: string; username: string; displayName?: string | null; avatar?: string | null }>>([]);
  const [taggedFriends, setTaggedFriends] = useState<Array<{ id: string; label: string }>>([]);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Array<{ spotId: string; rating: number; spot: { name: string } }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.id || user?.email || "anonymous";
  const ratingMood = getRatingMood(rating);

  useEffect(() => {
    async function loadFriendsAndRatings() {
      if (!user?.id) return;
      const [friendsRes, ratingsRes] = await Promise.all([
        fetch("/api/friends"),
        fetch(`/api/users/${user.id}/reviews`),
      ]);

      if (friendsRes.ok) {
        const data = (await friendsRes.json()) as {
          friends: Array<{ id: string; username: string; displayName?: string | null; avatar?: string | null }>;
        };
        setFriends(data.friends);
      }

      if (ratingsRes.ok) {
        const data = (await ratingsRes.json()) as {
          reviews: Array<{ spotId: string; rating: number; spot: { name: string } }>;
        };
        setRatings(data.reviews);
      }
    }

    void loadFriendsAndRatings();
  }, [user?.id]);

  function toggleTag(tag: string) {
    setGoodFor((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }

  function addTaggedFriend(friend: { id: string; username: string; displayName?: string | null }) {
    const label = friend.displayName ?? friend.username;
    setTaggedFriends((current) =>
      current.some((item) => item.id === friend.id) ? current : [...current, { id: friend.id, label }]
    );
    setFriendQuery("");
  }

  function removeTaggedFriend(friendId: string) {
    setTaggedFriends((current) => current.filter((value) => value.id !== friendId));
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((current) => [...current, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  const filteredFriends = useMemo(() => {
    const query = friendQuery.trim().toLowerCase();
    return friends
      .filter((friend) => !taggedFriends.some((item) => item.id === friend.id))
      .filter((friend) => {
        if (!query) return true;
        const label = `${friend.displayName ?? ""} ${friend.username}`.toLowerCase();
        return label.includes(query);
      })
      .slice(0, 6);
  }, [friendQuery, friends, taggedFriends]);

  const rankingPreview = useMemo(() => {
    const remaining = ratings.filter((item) => item.spotId !== spot.id);
    const withCurrent = [...remaining, { spotId: spot.id, rating, spot: { name: spot.name } }];
    const sorted = [...withCurrent].sort((a, b) => b.rating - a.rating);
    const rank = sorted.findIndex((item) => item.spotId === spot.id) + 1;
    return { rank, total: sorted.length, top: sorted.slice(0, 5) };
  }, [ratings, rating, spot.id, spot.name]);

  async function handleSubmit() {
    if (!reaction) {
      toast.error("Choose how you felt about the spot.");
      return;
    }
    if (!visitDate) {
      toast.error("Choose the date you visited.");
      return;
    }
    if (!user) {
      toast.error("Sign in to post a rating.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/spots/${spot.id}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          spotType: spotType || null,
          reaction,
          goodFor,
          taggedFriendIds: taggedFriends.map((friend) => friend.id),
          visitDate,
          text: text.trim(),
          liked: liked.trim(),
          disliked: disliked.trim(),
          images: photos,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({ error: "Could not submit rating" }))) as { error?: string };
        toast.error(errorData.error ?? "Could not submit rating");
        return;
      }

      const data = (await res.json()) as {
        review: {
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
          createdAt?: string;
          user: { username: string; displayName: string | null };
        };
      };

      const displayName = data.review.user.displayName ?? data.review.user.username;
      const review: Review = {
        id: data.review.id,
        spotId: spot.id,
        spotName: spot.name,
        spotImage: spot.image,
        profileHref: `/profile/${data.review.user.username}`,
        userId,
        userName: displayName,
        userInitial: (displayName || "A")[0].toUpperCase(),
        rating: data.review.rating,
        spotType: (data.review.spotType as SpotType) ?? (spotType || "Other"),
        reaction: (data.review.reaction as SpotReaction) ?? reaction,
        goodFor: data.review.goodFor,
        taggedPeople: data.review.taggedPeople,
        visitDate: data.review.visitDate ? data.review.visitDate.slice(0, 10) : visitDate,
        text: data.review.text,
        liked: data.review.liked ?? "",
        disliked: data.review.disliked ?? "",
        photos: data.review.images,
        date: "Just now",
        timestamp: Date.now(),
      };

      addReview(review);
      setRatings((current) => {
        const next = current.filter((item) => item.spotId !== spot.id);
        return [{ spotId: spot.id, rating: data.review.rating, spot: { name: spot.name } }, ...next];
      });
      toast.success("Rating submitted");
      onSubmitted?.(review);
    } catch (error) {
      console.error("Review submit failed:", error);
      toast.error("Could not submit rating");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(37,99,235,0.12)] dark:border-slate-700 dark:bg-slate-900">
      <div className="relative overflow-hidden border-b border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.35),_transparent_45%),linear-gradient(135deg,_#eff6ff_0%,_#ffffff_45%,_#f8fafc_100%)] p-5 dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_45%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#0f172a_100%)]">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl dark:bg-blue-500/20" />
        <div className="relative flex items-start gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-white/60 shadow-lg">
            <img src={spot.image} alt={spot.name} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563EB] shadow-sm dark:bg-slate-900/80">
                Rate This Spot
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1E3A5F] shadow-sm dark:bg-slate-900/80 dark:text-white">
                {rating}/10
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-[#1E3A5F] dark:text-white">{spot.name}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-[#2563EB]" />
              <span className="truncate">{spot.address}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1E3A5F] dark:text-white">{ratingMood.label}</p>
            <p className="text-sm text-gray-500 dark:text-slate-300">{ratingMood.description}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">Projected rank</p>
            <p className="mt-2 text-2xl font-bold text-[#1E3A5F] dark:text-white">#{rankingPreview.rank}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">out of {rankingPreview.total || 1} rated spots</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">Feel required</p>
            <p className="mt-2 text-lg font-bold text-[#1E3A5F] dark:text-white">
              {reaction ? REACTIONS.find((item) => item.value === reaction)?.label : "Choose your vibe"}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">This is one of the required parts of the rating.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">Visit date</p>
            <p className="mt-2 text-lg font-bold text-[#1E3A5F] dark:text-white">{visitDate || "Pick a date"}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">You only need a date, score, and feel to post.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">How did it feel?</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Pick the reaction that matches the overall vibe.</p>
              </div>
              {reaction ? (
                <button
                  type="button"
                  onClick={() => setReaction(null)}
                  className="text-xs font-semibold text-gray-500 underline-offset-2 hover:text-[#2563EB] hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3">
              {REACTIONS.map((item) => {
                const active = reaction === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReaction(item.value)}
                    className={`group rounded-[22px] border px-4 py-4 text-left transition-all ${
                      active
                        ? `${item.tone} ${item.glow} scale-[1.01]`
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-4 w-4 rounded-full ${item.dot}`} />
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className={`mt-1 text-sm ${active ? "opacity-90" : "text-gray-500 dark:text-slate-300"}`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Your score</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Rate it from 0 to 10.</p>
              </div>
              <div className="rounded-2xl bg-[#2563EB] px-4 py-3 text-center text-white shadow-lg">
                <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Score</p>
                <p className="text-2xl font-bold">{rating}</p>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-5 w-full accent-[#2563EB]"
            />

            <div className="mt-4 grid grid-cols-6 gap-2">
              {Array.from({ length: 11 }).map((_, index) => {
                const active = rating === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index)}
                    className={`rounded-2xl px-0 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[#2563EB] text-white shadow-md"
                        : "bg-white text-[#1E3A5F] hover:bg-blue-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                    }`}
                  >
                    {index}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-white p-3 text-sm shadow-sm dark:bg-slate-900">
              <p className="font-semibold text-[#1E3A5F] dark:text-white">{ratingMood.label}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">{ratingMood.description}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F] dark:text-white">What kind of place is this?</label>
            <select
              value={spotType}
              onChange={(e) => setSpotType(e.target.value as SpotType | "")}
              className="spotly-input"
            >
              <option value="">Optional</option>
              {SPOT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F] dark:text-white">Visit date</label>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-3 dark:border-slate-700">
              <CalendarDays className="h-4 w-4 text-[#2563EB]" />
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">What’s it good for?</p>
              <p className="text-xs text-gray-500 dark:text-slate-300">Optional tags that help other people understand the vibe.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB] dark:bg-slate-800">
              {goodFor.length} selected
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {GOOD_FOR_OPTIONS.map((option) => {
              const active = goodFor.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleTag(option)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#2563EB] text-white shadow-md"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Comments</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Optional, but this is where the review really gets useful.</p>
              </div>
              <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-slate-300">
                Optional
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="What stood out? Was it peaceful, crowded, comfy, awkward, underrated?"
              className="spotly-input mt-4 resize-none"
            />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-green-50 p-3 dark:bg-green-950/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-300">Liked</p>
                <input
                  value={liked}
                  onChange={(e) => setLiked(e.target.value)}
                  placeholder="Best part"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-green-700/60 dark:text-white"
                />
              </div>
              <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">Didn’t like</p>
                <input
                  value={disliked}
                  onChange={(e) => setDisliked(e.target.value)}
                  placeholder="Worst part"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-red-700/60 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <label className="mb-2 block text-sm font-semibold text-[#1E3A5F] dark:text-white">Tag people you went with</label>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-3 dark:border-slate-700">
                <Search className="h-4 w-4 text-[#2563EB]" />
                <input
                  value={friendQuery}
                  onChange={(e) => setFriendQuery(e.target.value)}
                  placeholder={friends.length > 0 ? "Search your friends" : "Add friends first to tag them"}
                  className="w-full bg-transparent text-sm outline-none dark:text-white"
                />
              </div>
              {filteredFriends.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filteredFriends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => addTaggedFriend(friend)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-[#2563EB] dark:border-slate-700 dark:bg-slate-800"
                    >
                      {friend.displayName ?? friend.username}
                    </button>
                  ))}
                </div>
              ) : null}
              {taggedFriends.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {taggedFriends.map((friend) => (
                    <span
                      key={friend.id}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-[#2563EB] dark:bg-slate-800"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {friend.label}
                      <button type="button" onClick={() => removeTaggedFriend(friend.id)}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {friends.length === 0 ? (
                <p className="mt-3 text-xs text-gray-500 dark:text-slate-300">
                  Only accepted friends can be tagged in a spot rating.
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Photos</p>
                  <p className="text-xs text-gray-500 dark:text-slate-300">Optional, up to 5 images.</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-semibold text-[#2563EB]"
                >
                  <Camera className="h-4 w-4" />
                  Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotos}
              />
              {photos.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-full items-center justify-center rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 text-center text-sm font-medium text-[#2563EB] transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950"
                >
                  <div>
                    <Camera className="mx-auto h-5 w-5" />
                    <p className="mt-2">Drop in a few photos if you want</p>
                  </div>
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-[#F8FAFC] p-4 dark:border-slate-700 dark:bg-slate-950/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Your current rating list</h4>
              <p className="text-xs text-gray-500 dark:text-slate-300">This spot moves automatically based on the score you choose.</p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm dark:bg-slate-900">
              #{rankingPreview.rank}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {ratings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-300">No ratings yet.</p>
            ) : (
              [...ratings]
                .filter((review) => review.spotId !== spot.id)
                .concat([{ spotId: spot.id, rating, spot: { name: spot.name } }])
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((review, index) => (
                  <div
                    key={`${review.spotId}-${index}`}
                    className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm dark:bg-slate-900"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">{review.spot.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-300">Rank #{index + 1}</p>
                    </div>
                    <span className="rounded-full bg-[#2563EB] px-3 py-1 text-sm font-semibold text-white">
                      {review.rating}/10
                    </span>
                  </div>
                ))
            )}
          </div>
        </section>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2 text-[#2563EB] shadow-sm dark:bg-slate-900">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#1E3A5F] dark:text-white">Ready to post your take?</p>
                <p className="text-sm text-gray-500 dark:text-slate-300">
                  Required: feel, rating, and visit date. Everything else is extra texture.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="spotly-button-primary flex min-w-[180px] items-center justify-center gap-2 rounded-2xl px-6 py-3"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Posting..." : "Post Rating"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
