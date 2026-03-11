"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Settings, MapPin, Star, Bookmark, Trophy,
  LogOut, Edit2, Check, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { ANN_ARBOR_SPOTS } from "@/data/spots";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous"
  );
  const [bio, setBio] = useState("Finding the best spots to grind 📚");
  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState(bio);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const saveEdit = () => {
    setDisplayName(editName);
    setBio(editBio);
    setEditing(false);
  };

  const stats = [
    { icon: <MapPin size={18} className="text-blue-500" />, value: "4", label: "Spots Added" },
    { icon: <Star size={18} className="text-yellow-500" />, value: "21", label: "Reviews" },
    { icon: <Bookmark size={18} className="text-blue-500" />, value: "12", label: "Saved" },
    { icon: <Trophy size={18} className="text-purple-500" />, value: "640", label: "Points" },
  ];

  const recentActivity = [
    { type: "review", spot: "Shapiro Library", text: "Amazing 24/7 spot!", rating: 5, time: "2 hours ago" },
    { type: "save", spot: "Law Library Reading Room", time: "Yesterday" },
    { type: "review", spot: "Duderstadt Center", text: "Best outlets on campus.", rating: 5, time: "3 days ago" },
  ];

  const savedSpots = ANN_ARBOR_SPOTS.slice(0, 4);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-gray-500 mb-4">Sign in to view your profile</p>
          <Link href="/login" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile card */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
                </div>

                {editing ? (
                  <div className="space-y-2 mb-4">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bio..."
                    />
                    <div className="flex gap-2 justify-center">
                      <button onClick={saveEdit} className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <Check size={12} /> Save
                      </button>
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                    <p className="text-sm text-gray-400 mb-1">@{user.email?.split("@")[0]}</p>
                    <p className="text-sm text-gray-500 mb-4">{bio}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mx-auto hover:underline"
                    >
                      <Edit2 size={13} /> Edit profile
                    </button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1">{s.icon}</div>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rank */}
              <div className="bg-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={18} className="text-yellow-300" />
                  <span className="font-semibold text-sm">Your Rank</span>
                </div>
                <p className="text-4xl font-bold">#9</p>
                <p className="text-blue-200 text-sm">of 1,240 contributors</p>
                <Link href="/leaderboard" className="block mt-3 text-center bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 rounded-xl transition-colors">
                  View Leaderboard →
                </Link>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            {/* Right: Activity + Saved */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        a.type === "review" ? "bg-yellow-50" : "bg-blue-50"
                      }`}>
                        {a.type === "review" ? <Star size={16} className="text-yellow-500" /> : <Bookmark size={16} className="text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {a.type === "review" ? "Reviewed " : "Saved "}
                          <span className="font-semibold">{a.spot}</span>
                        </p>
                        {a.type === "review" && a.text && (
                          <p className="text-xs text-gray-500 mt-0.5">"{a.text}"</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Spots */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Saved Spots</h2>
                  <Link href="/lists" className="text-sm text-blue-600 font-medium hover:underline">View all →</Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {savedSpots.map((spot) => (
                    <Link key={spot.id} href={`/spot/${spot.id}`} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                      <img src={spot.image} alt={spot.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{spot.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-400">{spot.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
