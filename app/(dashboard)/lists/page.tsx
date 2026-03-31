'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type ListRecord = {
  id: string;
  name: string;
  items: {
    id: string;
    spot: {
      id: string;
      images?: { url: string }[];
    };
  }[];
};

export default function ListsPage() {
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [newListName, setNewListName] = useState('');

  async function loadLists() {
    const res = await fetch('/api/lists');
    if (!res.ok) return;
    const data = (await res.json()) as { lists: ListRecord[] };
    setLists(data.lists);
  }

  useEffect(() => {
    void loadLists();
  }, []);

  async function createList() {
    if (!newListName.trim()) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newListName.trim() }),
    });

    if (!res.ok) {
      toast.error('Could not create list');
      return;
    }

    setNewListName('');
    toast.success('List created');
    await loadLists();
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-white">Your Lists</h1>
        <div className="flex items-center gap-2">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button type="button" onClick={createList} className="text-sm font-semibold text-[#2563EB]">
            New List
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="spotly-card px-6 py-12 text-center">
          <div className="text-4xl">🗂️</div>
          <p className="mt-3 font-semibold text-[#1E3A5F] dark:text-white">No lists yet.</p>
          <p className="text-sm text-gray-500 dark:text-slate-300">
            Start saving your favorite spots!
          </p>
          <Link href="/dashboard" className="spotly-button-primary mt-4 inline-block">
            Browse Spots
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800"
            >
              <div className="relative h-10 w-20 shrink-0">
                {list.items.slice(0, 3).map((item, index) => {
                  const image = item.spot.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800';
                  return (
                    <div
                      key={item.id}
                      className="absolute top-0 h-8 w-8 overflow-hidden rounded-lg border-2 border-white shadow-sm"
                      style={{ left: `${index * 16}px` }}
                    >
                      <Image src={image} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  );
                })}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1E3A5F] dark:text-white">{list.name}</p>
                <p className="text-sm text-gray-500 dark:text-slate-300">{list.items.length} spots</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
