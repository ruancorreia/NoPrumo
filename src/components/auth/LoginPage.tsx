import { useState, type FormEvent } from 'react'
import { ArrowRight, Building2, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { Logo } from '../layout/Logo'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@noprumo.local')
  const [password, setPassword] = useState('noprumo123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="login-page">
    <section className="login-brand">
      <Logo />
      <div>
        <span className="eyebrow">GESTÃO DE OBRAS</span>
        <h1>Controle cada etapa.<br />Mantenha tudo no prumo.</h1>
        <p>Operação de canteiro, equipe e desempenho executivo em uma única plataforma.</p>
      </div>
      <div className="login-brand-card"><Building2 size={22} /><span><strong>4 obras acompanhadas</strong><small>Ambiente demonstrativo local</small></span></div>
    </section>
    <section className="login-panel">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">BEM-VINDO</span>
        <h2>Acesse sua conta</h2>
        <p>Use as credenciais demonstrativas preenchidas abaixo.</p>
        <label className="form-field"><span>E-mail</span><div className="login-input"><Mail size={17} /><input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></div></label>
        <label className="form-field"><span>Senha</span><div className="login-input"><LockKeyhole size={17} /><input type="password" required value={password} onChange={event => setPassword(event.target.value)} /></div></label>
        {error && <div className="login-error" role="alert">{error}</div>}
        <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'} <ArrowRight size={17} /></button>
        <small className="login-demo">admin@noprumo.local · noprumo123</small>
      </form>
    </section>
  </main>
}
