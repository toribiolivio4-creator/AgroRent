import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'registro'
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, registro } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.nombre.trim()) { setError('Ingresá tu nombre'); setLoading(false); return }
        await registro(form.nombre, form.email, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión. Verificá tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">Agro<span>Rent</span></div>
        <div className="auth-tagline">
          Descubrí exactamente qué lote te está dando más rentabilidad y dónde estás perdiendo dinero.
        </div>
        {[
          'Registrá gastos e ingresos por lote',
          'Dashboard de rentabilidad al instante',
          'Ranking automático: el mejor lote primero',
          'Costo y ganancia por hectárea',
        ].map(f => (
          <div className="auth-feature" key={f}>
            <div className="auth-feature-dot" />
            <div className="auth-feature-text">{f}</div>
          </div>
        ))}
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 22, fontWeight: 500, color:'var(--soil)' }}>
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta gratis'}
            </div>
            <div style={{ fontSize: 13, color:'var(--clay)', marginTop: 4 }}>
              {mode === 'login' ? 'Ingresá para ver tus lotes' : 'Empezá a medir tu rentabilidad hoy'}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            {mode === 'registro' && (
              <div className="form-group">
                <label>Nombre completo</label>
                <input value={form.nombre} onChange={set('nombre')} placeholder="Ej: Juan Martínez" required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop: 4 }}>
              {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop: 20, fontSize: 13, color:'var(--clay)' }}>
            {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
            {' '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'registro' : 'login'); setError('') }}
              style={{ background:'none', border:'none', color:'var(--green)', cursor:'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
