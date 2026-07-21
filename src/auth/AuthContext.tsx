import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { currentUserRequest, loginRequest, type AuthUser } from '../services/api'

const sessionKey = 'noprumo.auth.token'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(sessionKey))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    currentUserRequest(token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem(sessionKey)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  async function login(email: string, password: string) {
    const session = await loginRequest(email, password)
    sessionStorage.setItem(sessionKey, session.token)
    setToken(session.token)
    setUser(session.user)
  }

  function logout() {
    sessionStorage.removeItem(sessionKey)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}
