"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin, TrendingUp, Mic, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import SpotCard from "@/components/SpotCard";
import ReviewCard from "@/components/ReviewCard";
import { ANN_ARBOR_SPOTS } from "@/data/spots";
import { useAuth } from "@/components/AuthProvider";
import { useReviews } from "@/components/ReviewProvider";

const StudyMap = dynamic(() => import("@/components/StudyMap"), { ssr: false });

const TAGS = ["All", "Quiet", "24/7", "Coffee", "WiFi", "Outlets", "Group Rooms", "Free", "Natural Light"];

export default function FeedPage() {
  const { user } = useAuth();
  const { reviews } = useReviews();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [showMap, setShowMap] = useState(false);
  const [activeSection, setActiveSection] = useState<"spots" | "reviews">("spots");

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const filtered = ANN_ARBOR_SPOTS.filter((s) => {
    const matchesQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      s.location.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag === "All" || s.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  const topSpots = [...ANN_ARBOR_SPOTS].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const centralSpots = ANN_ARBOR_SPOTS.filter((s) => s.location === "Central Campus").slice(0, 4);
  const recentReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
                <p className="text-gray-500 text-sm mt-1">Find your perfect study spot in Ann Arbor.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowMap(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!showMap ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  📋 List
                </button>
                <button onClick={() => setShowMap(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showMap ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  🗺️ Map
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 mt-4 max-w-2xl">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                placeholder="Search study spots, tags, locations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>}
              <Mic size={16} className="text-gray-400 shrink-0" />
            </div>

            {/* Tag filters */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {TAGS.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTag === tag ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showMap ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "70vh" }}>
              <StudyMap spots={filtered} height="100%" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Map strip */}
              {!query && activeTag === "All" && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative" style={{ height: 220 }}>
                  <StudyMap spots={ANN_ARBOR_SPOTS.slice(0, 8)} height="220px" zoom={13} />
                  <div className="absolute bottom-3 right-3">
                    <button onClick={() => setShowMap(true)}
                      className="bg-white text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md hover:bg-blue-50 transition-colors border border-blue-100">
                      View full map →
                    </button>
                  </div>
                </div>
              )}

              {/* Search results */}
              {(query || activeTag !== "All") && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    {query && ` for "${query}"`}
                    {activeTag !== "All" && ` · ${activeTag}`}
                  </h2>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Search size={32} className="mx-auto mb-3 opacity-40" />
                      <p>No spots found. Try different filters!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map((spot) => <SpotCard key={spot.id} spot={spot} />)}
                    </div>
                  )}
                </section>
              )}

              {!query && activeTag === "All" && (
                <>
                  {/* Spots / Reviews toggle */}
                  <div className="flex gap-2 border-b border-gray-200 pb-0">
                    <button
                      onClick={() => setActiveSection("spots")}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeSection === "spots" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      📍 Top Spots
                    </button>
                    <button
                      onClick={() => setActiveSection("reviews")}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeSection === "reviews" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      <MessageSquare size={14} />
                      Recent Reviews
                      {recentReviews.length > 0 && (
                        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{recentReviews.length}</span>
                      )}
                    </button>
                  </div>

                  {activeSection === "spots" && (
                    <>
                      {/* Top Spots */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Top Spots This Week</h2>
                          </div>
                          <Link href="/search" className="text-sm text-blue-600 font-medium hover:underline">See all →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {topSpots.slice(0, 3).map((spot) => <SpotCard key={spot.id} spot={spot} />)}
                        </div>
                      </section>

                      {/* Central Campus */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Central Campus</h2>
                          </div>
                          <Link href="/search?location=Central+Campus" className="text-sm text-blue-600 font-medium hover:underline">See all →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {centralSpots.map((spot) => <SpotCard key={spot.id} spot={spot} compact />)}
                        </div>
                      </section>

                      {/* All spots */}
                      <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">All Study Spots ({ANN_ARBOR_SPOTS.length})</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {ANN_ARBOR_SPOTS.map((spot) => <SpotCard key={spot.id} spot={spot} compact />)}
                        </div>
                      </section>
                    </>
                  )}

                  {activeSection === "reviews" && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
                        <span className="text-sm text-gray-400">{recentReviews.length} total</span>
                      </div>
                      {recentReviews.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                          <p className="font-medium">No reviews yet</p>
                          <p className="text-sm mt-1">Visit a spot and be the first to review!</p>
                          <Link href="/search" className="mt-4 inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                            Browse Spots
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recentReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} showSpot />
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
