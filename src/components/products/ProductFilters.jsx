import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import { SORT_FIELDS } from '../../utils/constants'

const SORT_LABELS = {
  title: 'Title',
  price: 'Price',
  rating: 'Rating',
}

export default function ProductFilters({
  categories,
  categoriesLoading,
  category,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  disableCategory = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="category-filter" className="sr-only">
          Category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={disableCategory || categoriesLoading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          title={disableCategory ? 'Clear search to use category filter' : undefined}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => {
            const slug = typeof cat === 'string' ? cat : cat.slug
            const name = typeof cat === 'string' ? cat : cat.name
            return (
              <option key={slug} value={slug}>
                {name}
              </option>
            )
          })}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <label htmlFor="sort-by" className="sr-only">
          Sort by
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, order)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              Sort: {SORT_LABELS[field]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
          aria-label={order === 'asc' ? 'Sort ascending, click for descending' : 'Sort descending, click for ascending'}
          title={order === 'asc' ? 'Ascending' : 'Descending'}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {order === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
        </button>
      </div>
    </div>
  )
}
