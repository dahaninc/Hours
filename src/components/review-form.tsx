"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ReviewForm({
  bookingId,
  existingReview,
}: {
  bookingId: string;
  existingReview: { rating: number; comment: string | null } | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitted, setSubmitted] = useState(!!existingReview);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("submit_booking_review", {
      p_booking_id: bookingId,
      p_rating: rating,
      p_comment: comment || undefined,
    });

    if (rpcError) {
      setError("Could not submit your review. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-background-subtle p-4 text-left">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn("h-4 w-4", n <= rating ? "fill-warning text-warning" : "text-border")}
            />
          ))}
        </div>
        {comment && <p className="mt-2 text-sm text-foreground-muted">{comment}</p>}
        <p className="mt-2 text-[12px] text-success">Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-background-subtle p-4 text-left">
      <h3 className="text-sm font-semibold">How did it go?</h3>
      <p className="mt-0.5 text-[13px] text-foreground-muted">Leave a quick review for the host.</p>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                n <= (hoverRating || rating) ? "fill-warning text-warning" : "text-border"
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        rows={2}
        className="mt-3"
        placeholder="Anything you'd like to share? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
      <Button size="sm" className="mt-3" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}
