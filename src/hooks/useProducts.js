import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProducts, searchProducts, getProductsByCategory } from '../api/productApi'
import { clampPage } from '../utils/urlParams'

/**
 * Manages fetching the product list for the given filter/sort/pagination
 * state. Handles:
 *  - loading / error state
 *  - retry (re-runs the last failed request)
 *  - stale-response protection (an in-flight request whose params are no
 *    longer current is ignored, using both AbortController cancellation
 *    AND a monotonically increasing request id as a belt-and-braces guard)
 *  - notifying the caller when the requested page is out of range so the
 *    caller can clamp the URL to a valid page
 *  - applying session-local add/edit/delete overrides (see
 *    ProductStoreContext) on top of whatever DummyJSON returns, since
 *    DummyJSON does not actually persist mutations
 *
 * DummyJSON limitation: there is no single endpoint that supports search +
 * category filtering together, so the resolution order is:
 *   1. search text present -> /products/search?q=
 *   2. category present (no search) -> /products/category/{category}
 *   3. neither -> /products
 */
export function useProducts({ page, limit, search, category, sortBy, order }, onPageClamp, store) {
  const [rawProducts, setRawProducts] = useState([])
  const [rawTotal, setRawTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const abortRef = useRef(null)
  const requestIdRef = useRef(0)
  const lastParamsRef = useRef(null)

  const fetchProducts = useCallback(
    async (params) => {
      // Cancel any in-flight request before starting a new one.
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      const requestId = ++requestIdRef.current
      lastParamsRef.current = params

      setLoading(true)
      setError(null)

      const skip = (params.page - 1) * params.limit

      try {
        let data
        if (params.search) {
          data = await searchProducts({
            q: params.search,
            limit: params.limit,
            skip,
            sortBy: params.sortBy,
            order: params.order,
            signal: controller.signal,
          })
        } else if (params.category) {
          data = await getProductsByCategory({
            category: params.category,
            limit: params.limit,
            skip,
            sortBy: params.sortBy,
            order: params.order,
            signal: controller.signal,
          })
        } else {
          data = await getProducts({
            limit: params.limit,
            skip,
            sortBy: params.sortBy,
            order: params.order,
            signal: controller.signal,
          })
        }

        // Ignore this response if a newer request has since been issued.
        if (requestId !== requestIdRef.current) return

        const fetchedTotal = data.total ?? 0
        setRawProducts(data.products || [])
        setRawTotal(fetchedTotal)
        setLoading(false)

        // If the requested page is beyond the last valid page, notify the
        // caller so it can update the URL to the clamped value.
        const safePage = clampPage(params.page, params.limit, fetchedTotal)
        if (safePage !== params.page && onPageClamp) {
          onPageClamp(safePage)
        }
      } catch (err) {
        // Aborted requests are expected when params change quickly; ignore.
        if (err?.isCanceled) return
        if (requestId !== requestIdRef.current) return

        setError(err?.message || 'Something went wrong.')
        setLoading(false)
      }
    },
    [onPageClamp]
  )

  useEffect(() => {
    fetchProducts({ page, limit, search, category, sortBy, order })
    // Cleanup: abort on unmount or before the next effect run.
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, category, sortBy, order])

  const retry = useCallback(() => {
    if (lastParamsRef.current) {
      fetchProducts(lastParamsRef.current)
    }
  }, [fetchProducts])

  // Re-derive the displayed list/total whenever the raw fetch result OR
  // the session's local mutations change - no network request needed.
  const { products, total } = useMemo(
    () => store.applyOverridesToList(rawProducts, rawTotal, { page, search, category }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawProducts, rawTotal, page, search, category, store.addedProducts, store.deletedIds]
  )

  return { products, total, loading, error, retry }
}

export default useProducts
