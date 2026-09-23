import { useNavigate } from 'react-router-dom'
import { LayoutGrid, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LayoutGrid size={18} aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">Product Admin</p>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {user.username?.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-gray-700">{user.username}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
