import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ProductStoreContext = createContext(null)

/**
 * DummyJSON's product mutations (add/update/delete) are simulated: the API
 * returns a realistic success response but never actually changes what a
 * later GET returns. If the app simply refetched after a mutation, an add
 * would 404 (the new id doesn't really exist), an edit would appear to
 * silently revert, and a delete would appear to silently undo itself.
 *
 * To make the app behave correctly for the current session, this store
 * keeps track of every local mutation - independent of which page/hook
 * instance performed it, and independent of navigation - so any part of
 * the app can render the up-to-date, session-local view of a product.
 */
export function ProductStoreProvider({ children }) {
  const [addedProducts, setAddedProducts] = useState([]) // newest first
  const [editedFields, setEditedFields] = useState({}) // id -> partial product fields
  const [deletedIds, setDeletedIds] = useState(() => new Set())

  const addProductLocally = useCallback((product) => {
    setAddedProducts((prev) => [product, ...prev])
  }, [])

  const editProductLocally = useCallback((id, fields) => {
    const numId = Number(id)
    setEditedFields((prev) => ({ ...prev, [numId]: { ...prev[numId], ...fields } }))
    // If this id belongs to a locally-added (not-yet-real) product, update
    // that entry directly too, so it stays consistent everywhere it's shown.
    setAddedProducts((prev) => prev.map((p) => (p.id === numId ? { ...p, ...fields } : p)))
  }, [])

  const deleteProductLocally = useCallback((id) => {
    const numId = Number(id)
    setDeletedIds((prev) => {
      if (prev.has(numId)) return prev
      const next = new Set(prev)
      next.add(numId)
      return next
    })
  }, [])

  const getAddedProduct = useCallback(
    (id) => addedProducts.find((p) => p.id === Number(id)) || null,
    [addedProducts]
  )

  const getEditedFields = useCallback((id) => editedFields[Number(id)] || null, [editedFields])

  const isDeleted = useCallback((id) => deletedIds.has(Number(id)), [deletedIds])

  /**
   * Apply every known local mutation to a freshly-fetched product list +
   * total, so the list always reflects the current session's changes.
   */
  const applyOverridesToList = useCallback(
    (rawProducts, rawTotal, { page, search, category }) => {
      let list = rawProducts.filter((p) => !deletedIds.has(p.id))
      list = list.map((p) => (editedFields[p.id] ? { ...p, ...editedFields[p.id] } : p))

      // Only surface locally-added products that would actually match the
      // current search/category filter, so they don't appear to "leak"
      // into unrelated views.
      const visibleAdded = addedProducts.filter((p) => {
        if (deletedIds.has(p.id)) return false
        if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false
        if (category && p.category !== category) return false
        return true
      })

      if (page === 1) {
        list = [...visibleAdded, ...list]
      }

      // Reported total grows by however many locally-added products are
      // visible under the current filter, so pagination math stays
      // consistent with what's actually shown.
      const adjustedTotal = rawTotal + visibleAdded.length

      return { products: list, total: adjustedTotal }
    },
    [addedProducts, editedFields, deletedIds]
  )

  /**
   * Resolve a single product for the details/edit pages, blending local
   * overrides with whatever was fetched (if anything) from the API.
   */
  const applyOverridesToProduct = useCallback(
    (id, fetched) => {
      const numId = Number(id)
      const edits = editedFields[numId]
      if (fetched) return edits ? { ...fetched, ...edits } : fetched
      const added = getAddedProduct(numId)
      return added ? { ...added, ...(edits || {}) } : null
    },
    [editedFields, getAddedProduct]
  )

  const value = useMemo(
    () => ({
      addedProducts,
      deletedIds,
      addProductLocally,
      editProductLocally,
      deleteProductLocally,
      getAddedProduct,
      getEditedFields,
      isDeleted,
      applyOverridesToList,
      applyOverridesToProduct,
    }),
    [
      addedProducts,
      deletedIds,
      addProductLocally,
      editProductLocally,
      deleteProductLocally,
      getAddedProduct,
      getEditedFields,
      isDeleted,
      applyOverridesToList,
      applyOverridesToProduct,
    ]
  )

  return <ProductStoreContext.Provider value={value}>{children}</ProductStoreContext.Provider>
}

export function useProductStore() {
  const ctx = useContext(ProductStoreContext)
  if (!ctx) throw new Error('useProductStore must be used within a ProductStoreProvider')
  return ctx
}
