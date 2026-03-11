"use client";

import { Trophy, Star, MapPin, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Sarah Chen", username: "@sarah_c", points: 2840, spots: 18, reviews: 94, badge: "🏆" },
  { rank: 2, name: "Jake Liu", username: "@jakeliu", points: 2310, spots: 14, reviews: 78, badge: "🥈" },
  { rank: 3, name: "Priya Mehta", username: "@priyam", points: 1975, spots: 11, reviews: 65, badge: "🥉" },
  { rank: 4, name: "Alex Kim", username: "@alexk", points: 1640, spots: 9, reviews: 54, badge: "" },
  { rank: 5, name: "Maria Santos", username: "@marias", points: 1420, spots: 8, reviews: 47, badge: "" },
  { rank: 6, name: "Tom Reid", username: "@tomr", points: 1180, spots: 7, reviews: 39, badge: "" },
  { rank: 7, name: "Emma Torres", username: "@emmat", points: 960, spots: 6, reviews: 31, badge: "" },
  { rank: 8, name: "Chris Wang", username: "@chrisw", points: 780, spots: 5, reviews: 25, badge: "" },
  { rank: 9, name: "Jordan Park", username: "@jordanp", points: 640, spots: 4, reviews: 21, badge: "" },
  { rank: 10, name: "Lily Rose", username: "@lilyr", points: 520, spots: 3, reviews: 17, badge: "" },
];

const POINT_INFO = [
  { icon: <MapPin size={16} className="text-blue-500" />, action: "Add a new study spot", points: "+50 pts" },
  { icon: <Star size={16} className="text-yellow-500" />, action: "Write a review", points: "+20 pts" },
  { icon: <MessageSquare size={16} className="text-green-500" />, action: "Get an upvote on your review", points: "+5 pts" },
  { icon: <Trophy size={16} className="text-purple-500" />, action: "Spot you added gets 10 reviews", points: "+100 pts" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy size={32} className="text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-500 text-sm mt-1">Top Spotly contributors this month</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Top 3 podium */}
            {MOCK_LEADERBOARD.slice(0, 3).map((entry, i) => (
              <div key={entry.rank} className={`bg-white rounded-2xl p-6 border text-center ${
                i === 0 ? "border-yellow-200 shadow-lg shadow-yellow-50" :
                i === 1 ? "border-gray-200" : "border-gray-200"
              }`}>
                <div className="text-3xl mb-2">{entry.badge}</div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 ${
                  i === 0 ? "bg-yellow-100 text-yellow-700" :
                  i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-700"
                }`}>
                  {entry.name[0]}
                </div>
                <p className="font-bold text-gray-900">{entry.name}</p>
                <p className="text-xs text-gray-400 mb-3">{entry.username}</p>
                <p className={`text-2xl font-bold ${i === 0 ? "text-yellow-600" : "text-blue-600"}`}>
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">points</p>
                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                  <span><b>{entry.spots}</b> spots</span>
                  <span><b>{entry.reviews}</b> reviews</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full leaderboard */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">All Rankings</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_LEADERBOARD.map((entry) => (
                  <div key={entry.rank} className={`flex items-center gap-4 px-5 py-3.5 ${
                    user?.email?.includes(entry.username.slice(1)) ? "bg-blue-50" : "hover:bg-gray-50"
                  } transition-colors`}>
                    <span className="text-sm font-bold text-gray-400 w-6 text-center">
                      {entry.badge || `#${entry.rank}`}
                    </span>
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                      {entry.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{entry.name}</p>
                      <p className="text-xs text-gray-400">{entry.username}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-blue-600">{entry.points.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to earn points */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">How to Earn Points</h3>
                <div className="space-y-3">
                  {POINT_INFO.map((info) => (
                    <div key={info.action} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{info.action}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 shrink-0">{info.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-1">Your Rank</h3>
                <p className="text-4xl font-bold">#9</p>
                <p className="text-blue-200 text-sm mt-1">640 points</p>
                <p className="text-xs text-blue-200 mt-3">140 more points to reach #8!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
