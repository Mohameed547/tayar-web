import RatingStars from "./RatingStars";
import type { Review } from "../types";

interface RatingSummaryProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function RatingSummary({
  reviews,
  averageRating,
  totalReviews,
}: RatingSummaryProps) {
  // Calculate distribution
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.round(r.rating) as 5 | 4 | 3 | 2 | 1;
    if (counts[rounded] !== undefined) {
      counts[rounded]++;
    }
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Average score */}
      <div className="flex flex-col items-center justify-center text-center md:border-r md:border-zinc-800 pr-0 md:pr-4">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
          Average Rating
        </span>
        <span className="text-4xl font-extrabold text-amber-400">
          {averageRating ? averageRating.toFixed(1) : "0.0"}
        </span>
        <RatingStars rating={Math.round(averageRating)} size={16} className="mt-2" />
        <span className="text-[10px] text-zinc-500 mt-1 font-medium">
          Based on {totalReviews} reviews
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="col-span-2 flex flex-col justify-center gap-2">
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = counts[stars];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="text-zinc-400 font-semibold w-3 text-right">
                {stars}
              </span>
              <span className="text-amber-400 text-[10px]">★</span>
              <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-zinc-500 font-medium w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
