import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'
import { getAuthData, clearAuthData } from '../utils/storage'

// The ONE shared Axios instance used by every API call in the app.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Request interceptor: attach the bearer token (if we have one) to every request.
api.interceptors.request.use(
  (config) => {
    const auth = getAuthData()
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: centralize error handling so components never
// have to deal with raw Axios errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cancelled requests get a consistent, easy-to-check shape too, so
    // every caller can use the same `err.isCanceled` check instead of
    // digging into axios-specific fields.
    if (axios.isCancel(error)) {
      return Promise.reject({ isCanceled: true, status: 0, message: 'Request canceled.', original: error })
    }

    const status = error.response?.status

    if (status === 401) {
      // Token is invalid/expired. Clear local auth state and let the app
      // (ProtectedRoute / AuthContext) redirect to /login on next render.
      clearAuthData()
    }

    const normalized = {
      isCanceled: false,
      status: status || 0,
      message: getFriendlyMessage(error, status),
      original: error,
    }

    return Promise.reject(normalized)
  }
)

function getFriendlyMessage(error, status) {
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }
  if (!error.response) {
    return 'Network error. Please check your connection and try again.'
  }
  switch (status) {
    case 400:
      return 'The request was invalid. Please check the form and try again.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 500:
      return 'Something went wrong on the server. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default api
