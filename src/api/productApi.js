import api from './axios'

/**
 * Fetch the paginated, sorted product list (no search/category filter).
 * @param {{ limit: number, skip: number, sortBy?: string, order?: string, signal?: AbortSignal }} params
 */
export function getProducts({ limit, skip, sortBy, order, signal }) {
  const params = { limit, skip }
  if (sortBy) params.sortBy = sortBy
  if (order) params.order = order
  return api.get('/products', { params, signal }).then((res) => res.data)
}

/**
 * Search products by free-text query.
 * @param {{ q: string, limit: number, skip: number, sortBy?: string, order?: string, signal?: AbortSignal }} params
 */
export function searchProducts({ q, limit, skip, sortBy, order, signal }) {
  const params = { q, limit, skip }
  if (sortBy) params.sortBy = sortBy
  if (order) params.order = order
  return api.get('/products/search', { params, signal }).then((res) => res.data)
}

/**
 * Fetch the list of available product categories (array of { slug, name, url }).
 */
export function getCategories({ signal } = {}) {
  return api.get('/products/categories', { signal }).then((res) => res.data)
}

/**
 * Fetch products belonging to a specific category slug.
 */
export function getProductsByCategory({ category, limit, skip, sortBy, order, signal }) {
  const params = { limit, skip }
  if (sortBy) params.sortBy = sortBy
  if (order) params.order = order
  return api
    .get(`/products/category/${encodeURIComponent(category)}`, { params, signal })
    .then((res) => res.data)
}

/**
 * Fetch a single product by id.
 */
export function getProductById(id, { signal } = {}) {
  return api.get(`/products/${id}`, { signal }).then((res) => res.data)
}

/**
 * Create a new product.
 */
export function addProduct(product) {
  return api.post('/products/add', product).then((res) => res.data)
}

/**
 * Update an existing product.
 */
export function updateProduct(id, product) {
  return api.put(`/products/${id}`, product).then((res) => res.data)
}

/**
 * Delete a product.
 */
export function deleteProduct(id) {
  return api.delete(`/products/${id}`).then((res) => res.data)
}
