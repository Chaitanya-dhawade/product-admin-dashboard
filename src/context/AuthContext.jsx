import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loginUser } from '../api/authApi'
import { getAuthData, setAuthData, clearAuthData } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authData, setAuthDataState] = useState(() => getAuthData())

  // Keep state in sync if another tab logs out / clears storage.
  useEffect(() => {
    function handleStorage() {
      setAuthDataState(getAuthData())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await loginUser({ username, password })
    // DummyJSON returns { id, username, email, firstName, lastName, image, accessToken/token, ... }
    const token = data.accessToken || data.token
    const payload = {
      token,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
      },
    }
    setAuthData(payload)
    setAuthDataState(payload)
    return payload
  }, [])

  const logout = useCallback(() => {
    clearAuthData()
    setAuthDataState(null)
  }, [])

  const value = {
    user: authData?.user || null,
    token: authData?.token || null,
    isAuthenticated: Boolean(authData?.token),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
