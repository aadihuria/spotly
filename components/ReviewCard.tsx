"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, MapPin, ImageIcon } from "lucide-react";
import { Review } from "@/components/ReviewProvider";

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 8 ? "bg-green-100 text-green-700 border-green-200" :
    rating >= 6 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-sm font-bold border ${color}`}>
      {rating}<span className="text-xs font-normal opacity-60">/10</span>
    </span>
  );
}

export default function ReviewCard({ review, showSpot = false }: { review: Review; showSpot?: boolean }) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {review.userInitial}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{review.userName}</p>
              <p className="text-xs text-gray-400">{review.date}</p>
            </div>
          </div>
          <RatingBadge rating={review.rating} />
        </div>

        {/* Spot link (shown in feed) */}
        {showSpot && (
          <Link href={`/spot/${review.spotId}`} className="flex items-center gap-1.5 mb-3 text-xs text-blue-600 font-medium hover:underline">
            <MapPin size={11} />
            {review.spotName}
          </Link>
        )}

        {/* Review text */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>

        {/* Pros / Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {review.liked && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <ThumbsUp size={12} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">Liked</span>
              </div>
              <p className="text-xs text-green-800">{review.liked}</p>
            </div>
          )}
          {review.disliked && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <ThumbsDown size={12} className="text-red-500" />
                <span className="text-xs font-semibold text-red-600">Didn't like</span>
              </div>
              <p className="text-xs text-red-700">{review.disliked}</p>
            </div>
          )}
        </div>

        {/* Photos */}
        {review.photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {review.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightboxPhoto(photo)}
                className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity shrink-0"
              >
                <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Review photo"
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold hover:opacity-70"
            onClick={() => setLightboxPhoto(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
