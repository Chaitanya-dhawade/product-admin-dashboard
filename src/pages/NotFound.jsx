import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <CompassIcon className="text-gray-300" size={48} aria-hidden="true" />
      <h1 className="text-2xl font-bold text-gray-900">404 — Page not found</h1>
      <p className="max-w-sm text-sm text-gray-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <Link
        to="/products"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
      >
        Back to Products
      </Link>
    </div>
  )
}
