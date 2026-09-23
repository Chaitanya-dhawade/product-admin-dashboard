import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LayoutGrid, Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { validateLoginForm } from '../utils/validators'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/products'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return // ignore duplicate clicks while a login is in flight

    const { errors, isValid } = validateLoginForm({ username, password })
    setFieldErrors(errors)
    setApiError('')
    if (!isValid) return

    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/products', { replace: true })
    } catch (err) {
      setApiError(
        err?.status === 400 || err?.status === 401
          ? 'Invalid username or password. Please try again.'
          : err?.message || 'Unable to log in right now. Please try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <LayoutGrid size={24} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-gray-900">Product Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your product catalog.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {apiError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {apiError}
            </p>
          )}

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: '' }))
              }}
              aria-invalid={Boolean(fieldErrors.username)}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.username
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-brand-500 focus:ring-brand-200'
              }`}
              placeholder="emilys"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }))
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-brand-500 focus:ring-brand-200'
                }`}
                placeholder="emilyspass"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Demo credentials: <span className="font-medium text-gray-500">emilys / emilyspass</span>
          </p>
        </form>
      </div>
    </div>
  )
}
