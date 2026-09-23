import { Link } from 'react-router-dom'
import { Star, Pencil, Trash2 } from 'lucide-react'

export default function ProductCard({ product, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-20 w-20 shrink-0 rounded-lg border border-gray-100 object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${product.id}`}
            className="block truncate font-semibold text-gray-900 hover:text-brand-600"
          >
            {product.title}
          </Link>
          <p className="mt-0.5 truncate text-xs capitalize text-gray-500">{product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-gray-900">${product.price}</span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              {product.rating}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <Link
          to={`/products/edit/${product.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Pencil size={14} />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  )
}
