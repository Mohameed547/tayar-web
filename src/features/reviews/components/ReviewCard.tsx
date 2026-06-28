import RatingStars from "./RatingStars";
import type { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  displayMode?: "reviewer" | "reviewee";
}

export default function ReviewCard({
  review,
  displayMode = "reviewee",
}: ReviewCardProps) {
  const name =
    displayMode === "reviewee"
      ? review.reviewee?.fullName || "Office/Driver"
      : review.reviewer?.fullName || "Customer";

  const trackingNumber = review.shipment?.trackingNumber || "N/A";
  const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";

  return (
    <div className="flex flex-col gap-2.5 border-b border-zinc-850 pb-4.5 last:border-none last:pb-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-zinc-200">{name}</span>
          <span className="text-[10px] text-zinc-500 font-medium">
            Shipment ID: <strong className="text-zinc-400">{trackingNumber}</strong>
            {displayMode === "reviewee" && (
              <span className="text-zinc-600"> • {review.revieweeType === "Office" ? "Office" : "Driver"}</span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">{dateStr}</span>
      </div>

      <RatingStars rating={review.rating} size={14} />

      {review.comment && (
        <p className="text-xs text-zinc-400 leading-relaxed italic bg-zinc-950/30 border-l border-zinc-800 pl-2.5 py-1">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </div>
  );
}
