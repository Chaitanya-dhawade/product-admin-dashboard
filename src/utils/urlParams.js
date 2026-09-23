import {
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  SORT_FIELDS,
  DEFAULT_SORT,
  SORT_ORDERS,
  DEFAULT_ORDER,
} from './constants'

/**
 * All helpers here are intentionally defensive: any malformed / missing
 * query parameter must fall back to a safe default rather than throwing
 * or producing a broken UI state.
 */

export function readPage(searchParams) {
  const raw = searchParams.get('page')
  const num = parseInt(raw, 10)
  if (!raw || Number.isNaN(num) || num < 1) return DEFAULT_PAGE
  return num
}

export function readLimit(searchParams) {
  const raw = searchParams.get('limit')
  const num = parseInt(raw, 10)
  if (!raw || Number.isNaN(num) || !PAGE_SIZE_OPTIONS.includes(num)) return DEFAULT_PAGE_SIZE
  return num
}

export function readSearch(searchParams) {
  const raw = searchParams.get('search')
  return raw ? raw.trim() : ''
}

export function readCategory(searchParams) {
  const raw = searchParams.get('category')
  return raw ? raw.trim() : ''
}

export function readSortBy(searchParams) {
  const raw = searchParams.get('sortBy')
  if (!raw || !SORT_FIELDS.includes(raw)) return DEFAULT_SORT
  return raw
}

export function readOrder(searchParams) {
  const raw = searchParams.get('order')
  if (!raw || !SORT_ORDERS.includes(raw)) return DEFAULT_ORDER
  return raw
}

/**
 * Given a raw page number, a limit, and a known total item count,
 * clamp the page into the valid range [1, totalPages] (or 1 if there
 * are no results at all).
 */
export function clampPage(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (page > totalPages) return totalPages
  if (page < 1) return 1
  return page
}

/**
 * Read and fully sanitize the entire product-list state from a
 * URLSearchParams instance in one call.
 */
export function readProductListState(searchParams) {
  return {
    page: readPage(searchParams),
    limit: readLimit(searchParams),
    search: readSearch(searchParams),
    category: readCategory(searchParams),
    sortBy: readSortBy(searchParams),
    order: readOrder(searchParams),
  }
}

/**
 * Build a plain object suitable for passing to setSearchParams,
 * omitting empty values so the URL stays clean.
 */
export function buildSearchParamsObject(state) {
  const obj = {}
  if (state.page) obj.page = String(state.page)
  if (state.limit) obj.limit = String(state.limit)
  if (state.search) obj.search = state.search
  if (state.category) obj.category = state.category
  if (state.sortBy) obj.sortBy = state.sortBy
  if (state.order) obj.order = state.order
  return obj
}
