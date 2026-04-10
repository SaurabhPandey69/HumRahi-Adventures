"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function FeedbackPage() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [review, setReview] = useState("");

  const submitFeedback = async () => {
    await fetch("/api/feedback/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId,
        review,
        rating,
        comment,
      }),
    });

    alert("✅ Thanks for your feedback!");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Give Feedback</h1>

    <div className="p-10">
      <h2 className="text-xl font-bold">Rate your experience</h2>

      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />

      <textarea
        placeholder="Write review"
        onChange={(e) => setReview(e.target.value)}
      />
        
      <textarea
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={submitFeedback}>
        Submit
      </button>
    </div>
    </div>
  );
}