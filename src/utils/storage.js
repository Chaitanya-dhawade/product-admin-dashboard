import { AUTH_STORAGE_KEY } from './constants'

/**
 * Safely read the persisted authentication payload from localStorage.
 * Returns null if nothing is stored or the stored value is corrupted.
 */
export function getAuthData() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.token) return null
    return parsed
  } catch (err) {
    console.error('Failed to read auth data from storage:', err)
    return null
  }
}

/**
 * Persist the authentication payload (user info + token) to localStorage.
 */
export function setAuthData(data) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to persist auth data to storage:', err)
  }
}

/**
 * Remove any persisted authentication data.
 */
export function clearAuthData() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear auth data from storage:', err)
  }
}
