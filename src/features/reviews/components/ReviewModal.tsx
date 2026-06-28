"use client";

import { useState } from "react";
import { X } from "lucide-react";
import RatingStars from "./RatingStars";
import { createReview } from "../api";
import { useNotifications } from "@/shared/providers/socket-notification-provider";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  shipmentId: string;
  trackingNumber: string;
  revieweeId: string;
  revieweeType: "Driver" | "Office";
  revieweeName: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  shipmentId,
  trackingNumber,
  revieweeId,
  revieweeType,
  revieweeName,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerLocalToast } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createReview({
        shipmentId,
        revieweeType,
        revieweeId,
        rating,
        comment: comment.trim(),
      });
      triggerLocalToast("Success", "Review submitted successfully!", "success");
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      triggerLocalToast("Error", err.response?.data?.message || "Failed to submit review.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 px-5 py-4">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Review Shipment {trackingNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
              Reviewing {revieweeType === "Office" ? "Office" : "Driver"}
            </label>
            <div className="text-sm font-semibold text-zinc-200 bg-zinc-850 border border-zinc-800 rounded-lg px-3 py-2">
              {revieweeName}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
              Your Rating
            </label>
            <RatingStars
              rating={rating}
              interactive={true}
              onChange={setRating}
              size={28}
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
              Review Comment (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              maxLength={500}
              className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 disabled:opacity-50 transition-all focus:outline-none shadow-sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
