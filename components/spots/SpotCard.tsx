'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function SpotCard({ spot }: { spot: { id: string; name: string; rating: number; tags: string[] } }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass overflow-hidden rounded-2xl p-4">
      <Link href={`/spots/${spot.id}`}>
        <h3 className="font-bold">{spot.name}</h3>
        <p className="text-sm text-white/70">Community rating {spot.rating}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {spot.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs">{tag}</span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
