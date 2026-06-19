import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export const RegistroPage: React.FC = () => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { registro, login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await registro(nombre, email, password)
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 14, right: 18, zIndex: 50 }}>
        <ThemeToggle />
      </div>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)', fontStyle: 'italic' }}>
            AgroRent
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Empezá gratis — 5 lotes incluidos</p>
        </div>

        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Crear cuenta</h1>

          {error && (
            <div style={{ background: 'var(--red-100)', color: 'var(--red-500)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Nombre completo', value: nombre, setter: setNombre, type: 'text', placeholder: 'Juan Pérez' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'juan@ejemplo.com' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} required value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-muted)', display: 'flex',
                  }}
                >
                  <i className={`ti ti-${showPassword ? 'eye-off' : 'eye'}`} style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
              Crear cuenta gratis
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
