import RatingStars from "./RatingStars";
import type { Review } from "../types";

interface ReviewTableProps {
  reviews: Review[];
  displayMode?: "reviewer" | "reviewee";
}

export default function ReviewTable({
  reviews,
  displayMode = "reviewer",
}: ReviewTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500 text-xs">
        No reviews available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <th className="py-3 px-4">
              {displayMode === "reviewer" ? "Customer" : "Office/Driver"}
            </th>
            <th className="py-3 px-4">Shipment</th>
            <th className="py-3 px-4">Rating</th>
            <th className="py-3 px-4">Comment</th>
            <th className="py-3 px-4 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850 text-xs">
          {reviews.map((review) => {
            const name =
              displayMode === "reviewer"
                ? review.reviewer?.fullName || "Customer"
                : review.reviewee?.fullName || "Office/Driver";

            const trackingNumber = review.shipment?.trackingNumber || "N/A";
            const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "";

            return (
              <tr key={review._id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 font-semibold text-zinc-200">{name}</td>
                <td className="py-3 px-4 text-zinc-400">{trackingNumber}</td>
                <td className="py-3 px-4">
                  <RatingStars rating={review.rating} size={12} />
                </td>
                <td className="py-3 px-4 text-zinc-400 max-w-xs truncate" title={review.comment}>
                  {review.comment || <span className="text-zinc-600 font-medium">No comment</span>}
                </td>
                <td className="py-3 px-4 text-zinc-500 text-right">{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
