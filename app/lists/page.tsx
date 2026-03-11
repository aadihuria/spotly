"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Plus, Star, MapPin, Trash2, Lock, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ANN_ARBOR_SPOTS } from "@/data/spots";
import { useAuth } from "@/components/AuthProvider";

type SpotList = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  spotIds: string[];
  createdAt: string;
};

export default function ListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<SpotList[]>([
    {
      id: "1",
      name: "My Favorites",
      description: "The spots I keep coming back to",
      isPublic: false,
      spotIds: ["1", "3", "10"],
      createdAt: "2 weeks ago",
    },
    {
      id: "2",
      name: "Late Night Study",
      description: "Open 24/7 or open late",
      isPublic: true,
      spotIds: ["1", "3"],
      createdAt: "1 month ago",
    },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(false);
  const [activeList, setActiveList] = useState<SpotList | null>(null);

  const createList = () => {
    if (!newName) return;
    const newList: SpotList = {
      id: Date.now().toString(),
      name: newName,
      description: newDesc,
      isPublic: newPublic,
      spotIds: [],
      createdAt: "Just now",
    };
    setLists([...lists, newList]);
    setNewName(""); setNewDesc(""); setNewPublic(false); setShowCreate(false);
  };

  const deleteList = (id: string) => {
    setLists(lists.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  if (activeList) {
    const spots = ANN_ARBOR_SPOTS.filter((s) => activeList.spotIds.includes(s.id));
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setActiveList(null)} className="text-sm text-blue-600 font-medium mb-4 hover:underline flex items-center gap-1">
              ← Back to lists
            </button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeList.name}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{activeList.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {activeList.isPublic ? <Globe size={12} className="text-green-500" /> : <Lock size={12} className="text-gray-400" />}
                  <span className="text-xs text-gray-400">{activeList.isPublic ? "Public" : "Private"} · {spots.length} spots</span>
                </div>
              </div>
            </div>
            {spots.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
                <p>No spots in this list yet.</p>
                <Link href="/search" className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline">Browse spots →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spots.map((spot) => (
                  <Link key={spot.id} href={`/spot/${spot.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="relative h-36 overflow-hidden">
                      <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{spot.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-600">{spot.rating}</span>
                        <span className="text-xs text-gray-400 ml-1">{spot.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Lists</h1>
              <p className="text-gray-500 text-sm mt-0.5">Organize your favorite study spots</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              New List
            </button>
          </div>

          {/* Create list form */}
          {showCreate && (
            <div className="bg-white rounded-2xl border border-blue-200 p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Create a new list</h3>
              <div className="space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="List name (e.g., Late Night Spots)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-600">Make list public (others can see it)</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={createList} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                    Create List
                  </button>
                  <button onClick={() => setShowCreate(false)} className="text-gray-500 text-sm px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lists grid */}
          {lists.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
              <p>No lists yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lists.map((list) => {
                const spots = ANN_ARBOR_SPOTS.filter((s) => list.spotIds.includes(s.id));
                return (
                  <div key={list.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-3 h-28">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="bg-gray-100">
                          {spots[i] ? (
                            <img src={spots[i].image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{list.name}</h3>
                          {list.description && <p className="text-xs text-gray-500 mt-0.5">{list.description}</p>}
                        </div>
                        <button onClick={() => deleteList(list.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{list.spotIds.length} spots</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {list.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                          {list.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveList(list)}
                        className="mt-3 w-full text-center text-sm text-blue-600 font-medium hover:underline"
                      >
                        View list →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
