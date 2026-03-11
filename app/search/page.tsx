"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import SpotCard from "@/components/SpotCard";
import { ANN_ARBOR_SPOTS } from "@/data/spots";
import { Spot } from "@/types";

const StudyMap = dynamic(() => import("@/components/StudyMap"), { ssr: false });

const LOCATIONS = ["All", "Central Campus", "North Campus", "Downtown", "Off Campus"];
const NOISE_LEVELS = ["Any", "Silent", "Quiet", "Moderate", "Loud"];
const PRICE_LEVELS = ["Any", "Free", "$", "$$"];
const ALL_TAGS = ["WiFi", "Outlets", "24/7", "Coffee", "Quiet", "Group Rooms", "Natural Light", "Printing", "Reservable", "Food"];

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "All");
  const [noise, setNoise] = useState("Any");
  const [price, setPrice] = useState("Any");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const filtered = ANN_ARBOR_SPOTS.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) &&
      !s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) &&
      !s.address.toLowerCase().includes(query.toLowerCase())) return false;
    if (location !== "All" && s.location !== location) return false;
    if (noise !== "Any" && !s.noise_level.toLowerCase().includes(noise.toLowerCase())) return false;
    if (price !== "Any" && s.price_level !== price) return false;
    if (selectedTags.length > 0 && !selectedTags.every((t) => s.tags.includes(t))) return false;
    return true;
  });

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const clearFilters = () => {
    setQuery(""); setLocation("All"); setNoise("Any"); setPrice("Any"); setSelectedTags([]);
  };

  const hasFilters = query || location !== "All" || noise !== "Any" || price !== "Any" || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        {/* Search header */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  placeholder="Search spots..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {query && <button onClick={() => setQuery("")}><X size={14} className="text-gray-400" /></button>}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${showFilters ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </button>
              <div className="hidden md:flex gap-1">
                <button onClick={() => setShowMap(false)} className={`px-3 py-2 rounded-xl text-sm font-medium ${!showMap ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>📋</button>
                <button onClick={() => setShowMap(true)} className={`px-3 py-2 rounded-xl text-sm font-medium ${showMap ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>🗺️</button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Location</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCATIONS.map((l) => (
                        <button key={l} onClick={() => setLocation(l)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${location === l ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Noise Level</label>
                    <div className="flex flex-wrap gap-1.5">
                      {NOISE_LEVELS.map((n) => (
                        <button key={n} onClick={() => setNoise(n)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${noise === n ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Price</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRICE_LEVELS.map((p) => (
                        <button key={p} onClick={() => setPrice(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${price === p ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Must-have Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_TAGS.map((tag) => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${selectedTags.includes(tag) ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 font-medium hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 mb-4 font-medium">
            {filtered.length} spot{filtered.length !== 1 ? "s" : ""} found
          </p>

          {showMap ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "72vh" }}>
              <StudyMap spots={filtered} selectedSpot={selectedSpot} onSpotClick={setSelectedSpot} height="100%" />
            </div>
          ) : (
            filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No spots match your filters</p>
                <button onClick={clearFilters} className="mt-3 text-blue-600 text-sm font-medium hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((spot) => <SpotCard key={spot.id} spot={spot} />)}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
