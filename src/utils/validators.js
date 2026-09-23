/**
 * Validation helpers for the Product form.
 * Each function returns an error string, or an empty string when valid.
 */

export function validateTitle(title) {
  if (!title || !title.trim()) return 'Title is required.'
  if (title.trim().length < 2) return 'Title must be at least 2 characters.'
  return ''
}

export function validateDescription(description) {
  if (!description || !description.trim()) return 'Description is required.'
  if (description.trim().length < 5) return 'Description must be at least 5 characters.'
  return ''
}

export function validatePrice(price) {
  if (price === '' || price === null || price === undefined) return 'Price is required.'
  const num = Number(price)
  if (Number.isNaN(num)) return 'Price must be a valid number.'
  if (num <= 0) return 'Price must be a positive number.'
  return ''
}

export function validateStock(stock) {
  if (stock === '' || stock === null || stock === undefined) return 'Stock is required.'
  const num = Number(stock)
  if (Number.isNaN(num)) return 'Stock must be a valid number.'
  if (!Number.isInteger(num)) return 'Stock must be a whole number.'
  if (num < 0) return 'Stock cannot be negative.'
  return ''
}

export function validateCategory(category) {
  if (!category || !category.trim()) return 'Category is required.'
  return ''
}

/**
 * Validate an entire product form payload at once.
 * Returns an object keyed by field name containing error strings (empty = valid).
 */
export function validateProductForm(values) {
  const errors = {
    title: validateTitle(values.title),
    description: validateDescription(values.description),
    price: validatePrice(values.price),
    stock: validateStock(values.stock),
    category: validateCategory(values.category),
  }
  const isValid = Object.values(errors).every((e) => e === '')
  return { errors, isValid }
}

export function validateLoginForm({ username, password }) {
  const errors = {}
  if (!username || !username.trim()) errors.username = 'Username is required.'
  if (!password || !password.trim()) errors.password = 'Password is required.'
  return { errors, isValid: Object.keys(errors).length === 0 }
}
