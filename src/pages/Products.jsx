import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductTable from '../components/products/ProductTable'
import ProductCard from '../components/products/ProductCard'
import ProductFilters from '../components/products/ProductFilters'
import SearchBar from '../components/products/SearchBar'
import Pagination from '../components/products/Pagination'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'
import ConfirmModal from '../components/common/ConfirmModal'
import useDebounce from '../hooks/useDebounce'
import useProducts from '../hooks/useProducts'
import { useProductStore } from '../context/ProductStoreContext'
import { getCategories } from '../api/productApi'
import { readProductListState, buildSearchParamsObject } from '../utils/urlParams'
import { deleteProduct } from '../api/productApi'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const store = useProductStore()

  const urlState = useMemo(() => readProductListState(searchParams), [searchParams])
  const { page, limit, search, category, sortBy, order } = urlState

  // Local input value so typing feels instant; the URL (and thus the
  // fetch) only updates once the user stops typing (debounced).
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    // Keep the local input in sync if the URL changes from elsewhere
    // (e.g. back/forward navigation).
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (debouncedSearch === search) return
    updateParams({ search: debouncedSearch, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setCategoriesLoading(true)
    getCategories({ signal: controller.signal })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (!err?.isCanceled) {
          console.error('Failed to load categories:', err)
        }
      })
      .finally(() => setCategoriesLoading(false))
    return () => controller.abort()
  }, [])

  function updateParams(partial) {
    const next = { page, limit, search, category, sortBy, order, ...partial }
    setSearchParams(buildSearchParamsObject(next))
  }

  const handlePageClamp = useCallback(
    (safePage) => {
      updateParams({ page: safePage })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit, search, category, sortBy, order]
  )

  const { products, total, loading, error, retry } = useProducts(
    { page, limit, search, category, sortBy, order },
    handlePageClamp,
    store
  )

  // Delete confirmation modal state
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function confirmDelete() {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteProduct(pendingDelete.id)
      store.deleteProductLocally(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete product. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const isSearchActive = Boolean(search)

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage your product catalog.</p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <ProductFilters
          categories={categories}
          categoriesLoading={categoriesLoading}
          category={category}
          onCategoryChange={(val) => updateParams({ category: val, page: 1 })}
          sortBy={sortBy}
          order={order}
          onSortChange={(newSortBy, newOrder) => updateParams({ sortBy: newSortBy, order: newOrder, page: 1 })}
          disableCategory={isSearchActive}
        />
      </div>

      {isSearchActive && category === '' && (
        <p className="mb-4 text-xs text-gray-400">
          Category filtering is unavailable while a search is active (DummyJSON does not support combined
          search + category queries). Clear your search to filter by category.
        </p>
      )}

      {loading && <Loader fullPage label="Loading products…" />}

      {!loading && error && <ErrorMessage message={error} onRetry={retry} />}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          title={isSearchActive ? 'No products match your search.' : 'No products found.'}
          message={isSearchActive ? 'Try a different search term.' : 'Try adjusting your filters.'}
          actionLabel={isSearchActive || category ? 'Clear filters' : undefined}
          onAction={
            isSearchActive || category
              ? () => {
                  setSearchInput('')
                  updateParams({ search: '', category: '', page: 1 })
                }
              : undefined
          }
        />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="hidden md:block">
            <ProductTable products={products} onDelete={setPendingDelete} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={setPendingDelete} />
            ))}
          </div>

          <div className="mt-5">
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={(p) => updateParams({ page: p })}
              onLimitChange={(newLimit) => updateParams({ limit: newLimit, page: 1 })}
            />
          </div>
        </>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete product?"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) {
            setPendingDelete(null)
            setDeleteError('')
          }
        }}
      />
      {deleteError && (
        <p role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {deleteError}
        </p>
      )}
    </DashboardLayout>
  )
}
