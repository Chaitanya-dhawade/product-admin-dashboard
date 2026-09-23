import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Displays a user-friendly error state with an optional retry action.
 */
export default function ErrorMessage({
  title = 'Something went wrong.',
  message = 'Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center ${className}`}
    >
      <AlertTriangle className="text-red-500" size={32} aria-hidden="true" />
      <div>
        <p className="font-semibold text-red-700">{title}</p>
        {message && <p className="mt-1 text-sm text-red-600">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  )
}
