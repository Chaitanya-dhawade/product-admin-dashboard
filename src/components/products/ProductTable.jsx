import { Link } from 'react-router-dom'
import { Star, Pencil, Trash2 } from 'lucide-react'

export default function ProductTable({ products, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
              Rating
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="transition hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link to={`/products/${product.id}`} className="flex items-center gap-3">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 object-cover"
                    loading="lazy"
                  />
                  <span className="max-w-xs truncate font-medium text-gray-900 hover:text-brand-600">
                    {product.title}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 capitalize text-gray-600">{product.category}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">${product.price}</td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-amber-600">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  {product.rating}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? product.stock : 'Out of stock'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/products/edit/${product.id}`}
                    aria-label={`Edit ${product.title}`}
                    className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-50"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.title}`}
                    className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
