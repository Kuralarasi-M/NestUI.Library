import { useEffect, useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import {
  getBookReviews,
  submitBookReview,
  type BookReview,
} from "../services/quizService";
import { getLoggedInUser } from "../services/authServices";

interface BookReviewsSectionProps {
  bookId: number;
}

export default function BookReviewsSection({ bookId }: BookReviewsSectionProps) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loggedUser = getLoggedInUser();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getBookReviews(bookId);
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !loggedUser) return;

    setSubmitting(true);
    try {
      const newReview = await submitBookReview(bookId, rating, comment.trim());
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-400" /> Reader Reviews & Discussions
      </h3>

      {/* Review Form */}
      {loggedUser ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-300">Your Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 mb-3"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Post Review
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-500 mb-6 italic">Please log in to leave a review.</p>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-sm text-slate-500 py-4 text-center">Loading discussion...</div>
      ) : reviews.length === 0 ? (
        <div className="text-sm text-slate-500 py-4 text-center">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800/80 text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{rev.userName}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
