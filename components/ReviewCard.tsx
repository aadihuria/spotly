"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin, Tag } from "lucide-react";
import { Review } from "@/components/ReviewProvider";

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 8 ? "bg-green-100 text-green-700 border-green-200" :
    rating >= 5 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-bold ${color}`}>
      {rating}
      <span className="text-xs font-normal opacity-70">/10</span>
    </span>
  );
}

function ReactionBadge({ reaction }: { reaction: Review["reaction"] }) {
  const config = {
    liked: "bg-green-50 text-green-700 border-green-200",
    okay: "bg-yellow-50 text-yellow-700 border-yellow-200",
    disliked: "bg-red-50 text-red-700 border-red-200",
  }[reaction];

  const label = {
    liked: "I Liked it!",
    okay: "It's okay",
    disliked: "I didn't like it",
  }[reaction];

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${config}`}>{label}</span>;
}

export default function ReviewCard({ review, showSpot = false }: { review: Review; showSpot?: boolean }) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const profileHref = (review as Review & { profileHref?: string }).profileHref;

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
              {review.userInitial}
            </div>
            <div>
              {profileHref ? (
                <Link href={profileHref} className="text-sm font-semibold text-gray-900 hover:text-[#2563EB] dark:text-white">
                  {review.userName}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.userName}</p>
              )}
              <p className="text-xs text-gray-400">{review.date}</p>
            </div>
          </div>
          <RatingBadge rating={review.rating} />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:bg-slate-800">
            {review.spotType}
          </span>
          <ReactionBadge reaction={review.reaction} />
        </div>

        {showSpot ? (
          <Link href={`/spots/${review.spotId}`} className="mb-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
            <MapPin className="h-3.5 w-3.5" />
            {review.spotName}
          </Link>
        ) : null}

        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-slate-300">{review.text}</p>

        <div className="mb-3 flex flex-wrap gap-2">
          {review.goodFor.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {review.liked ? (
            <div className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">
              <span className="mb-1 block font-semibold text-green-700">Liked</span>
              {review.liked}
            </div>
          ) : null}
          {review.disliked ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="mb-1 block font-semibold text-red-600">Didn't like</span>
              {review.disliked}
            </div>
          ) : null}
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {review.visitDate}
          </span>
          {review.taggedPeople.length > 0 ? (
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {review.taggedPeople.join(", ")}
            </span>
          ) : null}
        </div>

        {review.photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {review.photos.map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setLightboxPhoto(photo)}
                className="h-20 w-20 overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700"
              >
                <img src={photo} alt={`Review photo ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ImageIcon className="h-3.5 w-3.5" />
            No photos added
          </div>
        )}
      </div>

      {lightboxPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightboxPhoto(null)}>
          <img src={lightboxPhoto} alt="Review photo" className="max-h-full max-w-full rounded-2xl object-contain" />
        </div>
      ) : null}
    </>
  );
}
