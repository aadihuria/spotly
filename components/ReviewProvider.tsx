"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Review = {
  id: string;
  spotId: string;
  spotName: string;
  spotImage: string;
  userId: string;
  userName: string;
  userInitial: string;
  rating: number; // 0-10
  text: string;
  liked: string;   // what they liked
  disliked: string; // what they didn't like
  photos: string[]; // base64 or object URLs
  date: string;
  timestamp: number;
};

type ReviewContextType = {
  reviews: Review[];
  addReview: (review: Review) => void;
  getReviewsForSpot: (spotId: string) => Review[];
};

const ReviewContext = createContext<ReviewContextType>({
  reviews: [],
  addReview: () => {},
  getReviewsForSpot: () => [],
});

const SEED_REVIEWS: Review[] = [
  {
    id: "seed-1",
    spotId: "1",
    spotName: "Shapiro Undergraduate Library",
    spotImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
    userId: "seed",
    userName: "Alex K.",
    userInitial: "A",
    rating: 9,
    text: "Best late-night study spot on campus! Always has space even during finals week if you go to the upper floors.",
    liked: "Open 24/7, tons of outlets, great quiet floors on upper levels",
    disliked: "Gets super crowded during finals, printer lines can be long",
    photos: [],
    date: "2 days ago",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-2",
    spotId: "1",
    spotName: "Shapiro Undergraduate Library",
    spotImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
    userId: "seed2",
    userName: "Priya M.",
    userInitial: "P",
    rating: 8,
    text: "Really solid spot. The group study rooms are great if you book ahead. WiFi is fast and reliable.",
    liked: "Reservable group rooms, fast WiFi, lots of natural light on lower floors",
    disliked: "Loud on floors 1-2, hard to find a seat on weekday evenings",
    photos: [],
    date: "1 week ago",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-3",
    spotId: "3",
    spotName: "Duderstadt Center (DUDE)",
    spotImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
    userId: "seed3",
    userName: "Tom R.",
    userInitial: "T",
    rating: 10,
    text: "The DUDE is unmatched. 24/7, beautiful building, every kind of seating you could want. North campus gem.",
    liked: "Open 24/7, 3D printers, every type of workspace, huge building",
    disliked: "Far from central campus if you don't live on North",
    photos: [],
    date: "3 days ago",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-4",
    spotId: "10",
    spotName: "Law Library Reading Room",
    spotImage: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&auto=format&fit=crop",
    userId: "seed4",
    userName: "Emma T.",
    userInitial: "E",
    rating: 10,
    text: "Honestly the most beautiful study spot in all of Ann Arbor. The architecture alone motivates you to study.",
    liked: "Stunning architecture, pin-drop quiet, amazing atmosphere",
    disliked: "Limited hours, not open super late",
    photos: [],
    date: "5 days ago",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-5",
    spotId: "4",
    spotName: "Sweetwaters Coffee & Tea (S. State)",
    spotImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop",
    userId: "seed5",
    userName: "Jake L.",
    userInitial: "J",
    rating: 7,
    text: "Great vibe for a chill study session. Coffee is amazing. Gets busy on weekends but weekday mornings are perfect.",
    liked: "Amazing coffee, cozy atmosphere, good WiFi",
    disliked: "Limited outlets, small space, can get loud on weekends",
    photos: [],
    date: "4 days ago",
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
];

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);

  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const getReviewsForSpot = (spotId: string) =>
    reviews.filter((r) => r.spotId === spotId).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <ReviewContext.Provider value={{ reviews, addReview, getReviewsForSpot }}>
      {children}
    </ReviewContext.Provider>
  );
}

export const useReviews = () => useContext(ReviewContext);
