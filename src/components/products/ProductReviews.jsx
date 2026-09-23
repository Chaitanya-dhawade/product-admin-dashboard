import { Star } from 'lucide-react'
import EmptyState from '../common/EmptyState'

export default function ProductReviews({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState title="No reviews available." message="This product has not been reviewed yet." />
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review, idx) => (
        <li key={idx} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{review.reviewerName}</p>
            <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
          {review.date && (
            <p className="mt-2 text-xs text-gray-400">
              {new Date(review.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
