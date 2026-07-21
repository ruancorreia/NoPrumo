import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './components/auth/LoginPage'
import './styles.css'

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <main className="auth-loading"><div className="logo"><span className="logo-mark"><span /></span><span>No<span>Prumo</span></span></div><span>Validando sessão...</span></main>
  return user ? <App /> : <LoginPage />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider><Root /></AuthProvider>
  </StrictMode>,
)
