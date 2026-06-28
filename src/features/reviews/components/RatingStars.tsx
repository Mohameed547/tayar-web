"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  size?: number;
}

export default function RatingStars({
  rating,
  max = 5,
  interactive = false,
  onChange,
  className = "",
  size = 16,
}: RatingStarsProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, idx) => {
        const starValue = idx + 1;
        const filled = starValue <= rating;
        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
            } focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-700 fill-zinc-800"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
