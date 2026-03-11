"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Bookmark, MapPin, Wifi, Volume2, Zap } from "lucide-react";
import { Spot } from "@/types";

export default function SpotCard({ spot, compact = false }: { spot: Spot; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/spot/${spot.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <div className="relative overflow-hidden" style={{ height: compact ? 140 : 180 }}>
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:scale-110 transition-transform"
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          >
            <Bookmark size={14} className={saved ? "fill-blue-600 text-blue-600" : "text-gray-500"} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <span className="text-xs text-white/90 font-medium">{spot.location}</span>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{spot.name}</h3>
            <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded-lg">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-700 font-bold text-xs">{spot.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400 mb-2">
            <MapPin size={11} />
            <span className="text-xs truncate">{spot.address.split(",")[0]}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Volume2 size={10} className="text-blue-400" /> {spot.noise_level}
              </span>
              <span className="flex items-center gap-1">
                <Wifi size={10} className="text-blue-400" /> {spot.wifi_strength}
              </span>
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-blue-400" /> {spot.outlets}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {spot.tags.slice(0, compact ? 2 : 3).map((tag) => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
            {spot.tags.length > (compact ? 2 : 3) && (
              <span className="text-xs text-gray-400">+{spot.tags.length - (compact ? 2 : 3)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
