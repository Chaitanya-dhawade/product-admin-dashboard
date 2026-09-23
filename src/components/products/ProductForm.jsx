import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { validateProductForm } from '../../utils/validators'

const EMPTY_VALUES = {
  title: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  brand: '',
  thumbnail: '',
}

/**
 * Reusable form for both creating and editing a product.
 * `initialValues` is optional (used to prefill for edit mode).
 * `onSubmit` receives the sanitized payload and should return a Promise.
 */
export default function ProductForm({
  initialValues,
  categories = [],
  submitLabel = 'Save Product',
  submittingLabel = 'Saving…',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return // multiple-click protection

    const { errors: validationErrors, isValid } = validateProductForm(values)
    setErrors(validationErrors)
    setSubmitError('')
    if (!isValid) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category.trim(),
        stock: Number(values.stock),
        brand: values.brand.trim(),
        thumbnail: values.thumbnail.trim() || undefined,
      })
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save product. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" error={errors.title} required>
          <input
            id="title"
            type="text"
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={inputClass(errors.title)}
            aria-invalid={Boolean(errors.title)}
          />
        </Field>

        <Field label="Category" htmlFor="category" error={errors.category} required>
          <input
            id="category"
            list="category-options"
            type="text"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={inputClass(errors.category)}
            aria-invalid={Boolean(errors.category)}
            placeholder="e.g. smartphones"
          />
          <datalist id="category-options">
            {categories.map((cat) => {
              const slug = typeof cat === 'string' ? cat : cat.slug
              return <option key={slug} value={slug} />
            })}
          </datalist>
        </Field>

        <Field label="Price ($)" htmlFor="price" error={errors.price} required>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className={inputClass(errors.price)}
            aria-invalid={Boolean(errors.price)}
          />
        </Field>

        <Field label="Stock" htmlFor="stock" error={errors.stock} required>
          <input
            id="stock"
            type="number"
            step="1"
            min="0"
            value={values.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            className={inputClass(errors.stock)}
            aria-invalid={Boolean(errors.stock)}
          />
        </Field>

        <Field label="Brand" htmlFor="brand">
          <input
            id="brand"
            type="text"
            value={values.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            className={inputClass()}
          />
        </Field>

        <Field label="Thumbnail URL" htmlFor="thumbnail">
          <input
            id="thumbnail"
            type="url"
            value={values.thumbnail}
            onChange={(e) => handleChange('thumbnail', e.target.value)}
            className={inputClass()}
            placeholder="https://example.com/image.jpg"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="description" error={errors.description} required>
            <textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={inputClass(errors.description)}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>
        </div>
      </div>

      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {submittingLabel}
            </>
          ) : (
            <>
              <Save size={16} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, error, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function inputClass(error) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-200'
  }`
}
