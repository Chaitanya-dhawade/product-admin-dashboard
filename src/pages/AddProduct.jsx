import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductForm from '../components/products/ProductForm'
import { addProduct, getCategories } from '../api/productApi'
import { useProductStore } from '../context/ProductStoreContext'

export default function AddProduct() {
  const navigate = useNavigate()
  const store = useProductStore()
  const [categories, setCategories] = useState([])
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getCategories({ signal: controller.signal })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  async function handleSubmit(payload) {
    const created = await addProduct(payload)
    // DummyJSON's POST /products/add is simulated: it returns a
    // realistic-looking new product (with a new id) but never actually
    // persists it, so a later GET for that id would 404. Registering it
    // in the session-local store lets the rest of the app - the details
    // page we're about to redirect to, and the product list - treat it
    // as real for the rest of this session.
    store.addProductLocally(created)
    setSuccess(true)
    // Briefly show success feedback, then send the user to the new
    // product's (locally simulated) detail page.
    setTimeout(() => {
      navigate(`/products/${created.id}`, { replace: true })
    }, 900)
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

      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900">Add Product</h1>
        <p className="mt-0.5 text-sm text-gray-500">Create a new product in the catalog.</p>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} />
            Product created successfully! Redirecting…
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ProductForm
            categories={categories}
            submitLabel="Create Product"
            submittingLabel="Creating…"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/products')}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
