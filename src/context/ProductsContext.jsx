import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ProductsContext = createContext(null)

/**
 * DummyJSON simulates product mutations (add/edit/delete) but never
 * actually persists them server-side: a GET issued right after a mutation
 * returns the original, unmodified data (or 404s for a "new" id).
 *
 * To make Add / Edit / Delete actually behave correctly for the rest of
 * the session, this context keeps a small client-side overlay on top of
 * whatever the API returns:
 *   - `added`     : id -> full product object, for products created this session
 *   - `edited`    : id -> partial product fields that override API data
 *   - `deletedIds`: set of ids that should be treated as gone
 *
 * Every screen that reads product data (the list, the details page, the
 * edit form) consults this overlay so a session's changes stay consistent
 * everywhere, without ever claiming DummyJSON itself saved anything.
 */
export function ProductsProvider({ children }) {
  const [added, setAdded] = useState({})
  const [edited, setEdited] = useState({})
  const [deletedIds, setDeletedIds] = useState(() => new Set())

  const recordAdded = useCallback((product) => {
    const id = Number(product.id)
    setAdded((prev) => ({ ...prev, [id]: { ...product, id } }))
  }, [])

  const recordEdited = useCallback((id, patch) => {
    const numId = Number(id)
    setEdited((prev) => ({ ...prev, [numId]: { ...(prev[numId] || {}), ...patch } }))
    // If this id was itself created locally this session, fold the edit
    // straight into the stored "added" copy too.
    setAdded((prev) => (prev[numId] ? { ...prev, [numId]: { ...prev[numId], ...patch } } : prev))
  }, [])

  const recordDeleted = useCallback((id) => {
    const numId = Number(id)
    setDeletedIds((prev) => {
      const next = new Set(prev)
      next.add(numId)
      return next
    })
  }, [])

  /**
   * Full local product for `id` (a product created this session), with any
   * later edits already folded in. Undefined if `id` wasn't created locally.
   */
  const getAddedProduct = useCallback(
    (id) => {
      const p = added[Number(id)]
      return p ? { ...p, ...(edited[Number(id)] || {}) } : undefined
    },
    [added, edited]
  )

  /** Edit overlay fields for `id` (undefined if there are none). */
  const getEditOverride = useCallback((id) => edited[Number(id)], [edited])

  const isDeleted = useCallback((id) => deletedIds.has(Number(id)), [deletedIds])

  // All locally-added products (that haven't since been deleted), newest first.
  const addedProducts = useMemo(
    () =>
      Object.values(added)
        .filter((p) => !deletedIds.has(Number(p.id)))
        .reverse(),
    [added, deletedIds]
  )

  // Given a page of products fetched from the API, drop anything deleted
  // this session and merge in any edits.
  const applyOverridesToList = useCallback(
    (products) =>
      products
        .filter((p) => !deletedIds.has(Number(p.id)))
        .map((p) => (edited[Number(p.id)] ? { ...p, ...edited[Number(p.id)] } : p)),
    [edited, deletedIds]
  )

  const value = useMemo(
    () => ({
      recordAdded,
      recordEdited,
      recordDeleted,
      getAddedProduct,
      getEditOverride,
      isDeleted,
      addedProducts,
      applyOverridesToList,
    }),
    [recordAdded, recordEdited, recordDeleted, getAddedProduct, getEditOverride, isDeleted, addedProducts, applyOverridesToList]
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProductsContext() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProductsContext must be used within a ProductsProvider')
  return ctx
}
