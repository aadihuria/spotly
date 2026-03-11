"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useReviews, Review } from "@/components/ReviewProvider";
import { Spot } from "@/types";

export default function WriteReview({ spot, onSubmitted }: { spot: Spot; onSubmitted?: () => void }) {
  const { user } = useAuth();
  const { addReview } = useReviews();

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayRating = hoverRating ?? rating;

  const ratingLabel = (r: number) => {
    if (r <= 2) return "😬 Terrible";
    if (r <= 4) return "😕 Not great";
    if (r === 5) return "😐 Okay";
    if (r <= 7) return "🙂 Pretty good";
    if (r === 8) return "😊 Great";
    if (r === 9) return "🤩 Amazing";
    return "🔥 Perfect";
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (photos.length >= 5) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev.slice(0, 4), ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!rating || !text.trim()) return;
    setSubmitting(true);

    const review: Review = {
      id: Date.now().toString(),
      spotId: spot.id,
      spotName: spot.name,
      spotImage: spot.image,
      userId: user?.id || "anonymous",
      userName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous",
      userInitial: (user?.user_metadata?.full_name || user?.email || "A")[0].toUpperCase(),
      rating,
      text: text.trim(),
      liked: liked.trim(),
      disliked: disliked.trim(),
      photos,
      date: "Just now",
      timestamp: Date.now(),
    };

    addReview(review);

    // Simulate a small delay so it feels "real"
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setSubmitted(true);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-bold text-green-800">Review posted!</p>
        <p className="text-sm text-green-600 mt-1">Thanks for helping other students find great spots.</p>
        <button
          onClick={() => { setSubmitted(false); setRating(null); setText(""); setLiked(""); setDisliked(""); setPhotos([]); }}
          className="mt-3 text-sm text-green-700 font-medium hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-gray-900">Write a Review</h3>

      {/* 0-10 Rating */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Overall Rating
          {displayRating !== null && (
            <span className="ml-2 text-blue-600">{displayRating}/10 — {ratingLabel(displayRating)}</span>
          )}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => setRating(n)}
              className={`w-9 h-9 rounded-xl text-sm font-bold border-2 transition-all ${
                (displayRating ?? 0) >= n
                  ? "bg-blue-600 border-blue-600 text-white scale-105"
                  : "bg-white border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your experience at this spot — atmosphere, focus level, what you were doing there..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-green-700 mb-1.5 flex items-center gap-1.5">
            <ThumbsUp size={14} /> What did you like?
          </label>
          <input
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            placeholder="e.g. Open late, great WiFi, cozy vibe"
            className="w-full bg-white border border-green-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-red-600 mb-1.5 flex items-center gap-1.5">
            <ThumbsDown size={14} /> What didn't you like?
          </label>
          <input
            value={disliked}
            onChange={(e) => setDisliked(e.target.value)}
            placeholder="e.g. Too crowded, no outlets"
            className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Add Photos <span className="text-gray-400 font-normal">(up to 5)</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-colors shrink-0"
            >
              <ImagePlus size={18} className="text-gray-400" />
              <span className="text-xs text-gray-400">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotos}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!rating || !text.trim() || submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send size={15} />
        {submitting ? "Posting..." : "Post Review"}
      </button>
    </div>
  );
}
