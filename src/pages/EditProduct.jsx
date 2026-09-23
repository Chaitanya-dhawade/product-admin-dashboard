import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductForm from '../components/products/ProductForm'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import { getProductById, updateProduct, getCategories } from '../api/productApi'
import { useProductStore } from '../context/ProductStoreContext'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useProductStore()

  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [success, setSuccess] = useState(false)

  function load() {
    if (store.isDeleted(id)) {
      setNotFound(true)
      setLoading(false)
      return { abort() {} }
    }

    // Same reasoning as ProductDetails: a locally-created product only
    // exists in the store, so skip the (would-404) API fetch entirely.
    const addedLocally = store.getAddedProduct(id)
    if (addedLocally) {
      setProduct(addedLocally)
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
        setProduct(store.applyOverridesToProduct(id, data))
        setLoading(false)
      })
      .catch((err) => {
        if (err?.isCanceled) return
        if (err?.status === 404) setNotFound(true)
        else setError(err?.message || 'Something went wrong.')
        setLoading(false)
      })

    return controller
  }

  useEffect(() => {
    const controller = load()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    getCategories({ signal: controller.signal })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  async function handleSubmit(payload) {
    // A locally-created product was never really persisted on DummyJSON,
    // so there's no real record for PUT to update - the store already
    // holds the full picture, so we just update that.
    if (!store.getAddedProduct(id)) {
      await updateProduct(id, payload)
    }
    store.editProductLocally(id, payload)
    setSuccess(true)
    setTimeout(() => {
      navigate(`/products/${id}`, { replace: true })
    }, 900)
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-semibold text-gray-900">Product not found.</p>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-0.5 text-sm text-gray-500">Update the details for this product.</p>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} />
            Product updated successfully! Redirecting…
          </div>
        )}

        {loading && <Loader fullPage label="Loading product…" />}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}

        {!loading && !error && product && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <ProductForm
              key={id}
              initialValues={{
                title: product.title || '',
                description: product.description || '',
                price: product.price ?? '',
                category: product.category || '',
                stock: product.stock ?? '',
                brand: product.brand || '',
                thumbnail: product.thumbnail || '',
              }}
              categories={categories}
              submitLabel="Save Changes"
              submittingLabel="Saving…"
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/products/${id}`)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
