import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZE_OPTIONS } from '../../utils/constants'

/**
 * Builds a compact list of page numbers to display, with `null` entries
 * representing an ellipsis. E.g. [1, null, 4, 5, 6, null, 12]
 */
function buildPageList(current, totalPages) {
  const delta = 1
  const range = []
  const rangeWithDots = []
  let last = null

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (last !== null) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (i - last > 2) {
        rangeWithDots.push(null)
      }
    }
    rangeWithDots.push(i)
    last = i
  }

  return rangeWithDots
}

export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)
  const pages = buildPageList(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-4 sm:flex-row">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {total === 0 ? 'No results' : `Showing ${startItem}–${endItem} of ${total}`}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="sr-only">Items per page</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, idx) =>
            p === null ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                  p === page
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <span className="text-sm text-gray-600 sm:hidden">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  )
}
