import { PackageOpen } from 'lucide-react'

/**
 * Displays a friendly empty-state message, with an optional action button.
 */
export default function EmptyState({
  title = 'Nothing here yet.',
  message = '',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center ${className}`}
    >
      <PackageOpen className="text-gray-400" size={32} aria-hidden="true" />
      <div>
        <p className="font-semibold text-gray-700">{title}</p>
        {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
