import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Star, Tag, Trash2 } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import ConfirmModal from '../components/common/ConfirmModal'
import ProductReviews from '../components/products/ProductReviews'
import { getProductById, deleteProduct } from '../api/productApi'
import { useProductStore } from '../context/ProductStoreContext'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useProductStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function setProductAndImage(data) {
    setProduct(data)
    setActiveImage(data.thumbnail || data.images?.[0] || null)
  }

  function load() {
    // A product that was deleted earlier this session should never show
    // up again, even though DummyJSON would still happily return it.
    if (store.isDeleted(id)) {
      setNotFound(true)
      setLoading(false)
      return { abort() {} }
    }

    // A product created earlier this session only exists locally -
    // DummyJSON's POST /products/add doesn't actually persist it, so a
    // GET for its id would 404. Serve it straight from the store.
    const addedLocally = store.getAddedProduct(id)
    if (addedLocally) {
      setProductAndImage(addedLocally)
      setLoading(false)
      setError(null)
      setNotFound(false)
      return { abort() {} }
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setNotFound(false)

    getProductById(id, { signal: controller.signal })
      .then((data) => {
        // Overlay any local edits made to this (real) product this session.
        setProductAndImage(store.applyOverridesToProduct(id, data))
        setLoading(false)
      })
      .catch((err) => {
        if (err?.isCanceled) return
        if (err?.status === 404) {
          setNotFound(true)
        } else {
          setError(err?.message || 'Something went wrong.')
        }
        setLoading(false)
      })

    return controller
  }

  useEffect(() => {
    const controller = load()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      // A product that only ever existed locally was never really
      // created on DummyJSON, so there's nothing real to call DELETE on.
      if (!store.getAddedProduct(id)) {
        await deleteProduct(id)
      }
      store.deleteProductLocally(id)
      navigate('/products', { replace: true })
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete product. Please try again.')
      setDeleting(false)
    }
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-semibold text-gray-900">Product not found.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      {loading && <Loader fullPage label="Loading product…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && product && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-2">
            <div>
              <img
                src={activeImage}
                alt={product.title}
                className="aspect-square w-full rounded-xl border border-gray-100 object-cover"
              />
              {product.images?.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        activeImage === img ? 'border-brand-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-700">
                <Tag size={12} />
                {product.category}
              </p>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">{product.title}</h1>
              {product.brand && <p className="mt-1 text-sm text-gray-500">by {product.brand}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                {Boolean(product.discountPercentage) && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {product.discountPercentage}% off
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                  {product.rating}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-gray-600">{product.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/products/edit/${product.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
                >
                  <Pencil size={16} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
              {deleteError && <p className="mt-3 text-sm text-red-600">{deleteError}</p>}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Reviews</h2>
            <ProductReviews reviews={product.reviews} />
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete product?"
        message={product ? `Are you sure you want to delete "${product.title}"? This action cannot be undone.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirmOpen(false)}
      />
    </DashboardLayout>
  )
}
