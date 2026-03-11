"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Bookmark, Heart, MapPin, Clock, Wifi, Volume2,
  Zap, Users, Coffee, ChevronLeft, Share2, ExternalLink, Star
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import WriteReview from "@/components/WriteReview";
import { ANN_ARBOR_SPOTS } from "@/data/spots";
import { useAuth } from "@/components/AuthProvider";
import { useReviews } from "@/components/ReviewProvider";

const StudyMap = dynamic(() => import("@/components/StudyMap"), { ssr: false });

export default function SpotPage({ params }: { params: { id: string } }) {
  const spot = ANN_ARBOR_SPOTS.find((s) => s.id === params.id);
  if (!spot) return notFound();

  const { user } = useAuth();
  const { getReviewsForSpot } = useReviews();
  const reviews = getReviewsForSpot(spot.id);

  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : spot.rating;

  const attrs = [
    { icon: <Volume2 size={16} />, label: "Noise", value: spot.noise_level },
    { icon: <Wifi size={16} />, label: "WiFi", value: spot.wifi_strength },
    { icon: <Zap size={16} />, label: "Outlets", value: spot.outlets },
    { icon: <Users size={16} />, label: "Seating", value: spot.seating },
    { icon: <Coffee size={16} />, label: "Coffee", value: spot.tags.includes("Coffee") ? "Nearby" : "No" },
    { icon: <Clock size={16} />, label: "Hours", value: spot.hours.includes("24") ? "24/7" : "Check hours" },
  ];

  const relatedSpots = ANN_ARBOR_SPOTS.filter(
    (s) => s.id !== spot.id && s.location === spot.location
  ).slice(0, 3);

  const reviewPhotos = reviews.flatMap((r) => r.photos);
  const allPhotos = [...spot.photos, ...reviewPhotos];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="relative h-72 md:h-96 bg-gray-200">
          <img src={allPhotos[activePhoto] || spot.image} alt={spot.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Link href="/feed" className="absolute top-6 left-6 bg-white/90 backdrop-blur rounded-full p-2 shadow-md">
            <ChevronLeft size={20} className="text-gray-700" />
          </Link>
          <div className="absolute top-6 right-6 flex gap-2">
            <button onClick={() => setLiked(!liked)} className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md">
              <Heart size={18} className={liked ? "fill-red-500 text-red-500" : "text-gray-600"} />
            </button>
            <button onClick={() => setSaved(!saved)} className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md">
              <Bookmark size={18} className={saved ? "fill-blue-600 text-blue-600" : "text-gray-600"} />
            </button>
            <button className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md">
              <Share2 size={18} className="text-gray-600" />
            </button>
          </div>
          {allPhotos.length > 1 && (
            <div className="absolute bottom-16 left-4 flex gap-2 overflow-x-auto max-w-full pb-1 pr-4">
              {allPhotos.map((photo, i) => (
                <button key={i} onClick={() => setActivePhoto(i)}
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === activePhoto ? "border-white scale-105" : "border-white/40 opacity-70"}`}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="absolute bottom-5 left-6 right-6">
            <h1 className="text-2xl font-bold text-white drop-shadow">{spot.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={13} className="text-white/80" />
              <span className="text-white/80 text-sm">{spot.address}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Rating summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl font-bold text-gray-900">{avgRating}</div>
                    <div>
                      <div className="text-sm text-gray-400 font-medium">out of 10</div>
                      <div className="text-sm text-gray-400">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-40 space-y-1.5">
                    {[[9,10],[7,8],[5,6],[3,4],[1,2]].map(([lo, hi]) => {
                      const count = reviews.filter((r) => r.rating >= lo && r.rating <= hi).length;
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={lo} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-8 shrink-0">{lo}-{hi}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${spot.price_level === "Free" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{spot.price_level}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{spot.crowd_level}</span>
                  {spot.tags.map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Attributes */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">Study Attributes</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attrs.map((a) => (
                    <div key={a.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-blue-500 shrink-0">{a.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{a.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{a.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-2">Hours</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-sm">{spot.hours}</span>
                </div>
              </div>

              {/* Reviews */}
              <div id="reviews" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Reviews ({reviews.length})</h2>
                  {user && !showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)}
                      className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                      + Write a Review
                    </button>
                  )}
                </div>

                {!user && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Sign in to share your experience</p>
                    <Link href="/login" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors inline-block">
                      Sign In
                    </Link>
                  </div>
                )}

                {user && showReviewForm && (
                  <WriteReview spot={spot} onSubmitted={() => setShowReviewForm(false)} />
                )}

                {reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                    <Star size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm">Be the first to review this spot!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-48">
                  <StudyMap spots={[spot]} center={[spot.lat, spot.lng]} zoom={16} height="192px" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700">{spot.address}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline">
                    <ExternalLink size={13} /> Open in Google Maps
                  </a>
                </div>
              </div>

              <button onClick={() => setSaved(!saved)}
                className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${saved ? "bg-blue-600 text-white" : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"}`}>
                <Bookmark size={16} className={saved ? "fill-white" : ""} />
                {saved ? "Saved!" : "Save this spot"}
              </button>

              {user && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-colors">
                  ⭐ Rate this spot
                </button>
              )}

              {relatedSpots.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">More in {spot.location}</h3>
                  <div className="space-y-3">
                    {relatedSpots.map((s) => (
                      <Link key={s.id} href={`/spot/${s.id}`} className="flex gap-3 hover:bg-gray-50 rounded-xl p-1 transition-colors">
                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{s.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.crowd_level}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
