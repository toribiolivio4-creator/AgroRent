import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'

interface NavItem {
  to: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: 'chart-bar', label: 'Dashboard' },
  { to: '/lotes', icon: 'map', label: 'Mis lotes' },
  { to: '/gastos', icon: 'arrow-up-circle', label: 'Gastos' },
  { to: '/ingresos', icon: 'arrow-down-circle', label: 'Ingresos' },
  { to: '/ranking', icon: 'award', label: 'Ranking' },
]

export const Sidebar: React.FC = () => {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 230, minWidth: 230, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '0 0 16px',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)', fontStyle: 'italic' }}>
          AgroRent
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2 }}>
          Rentabilidad por lote
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '6px 12px 4px' }}>
          Principal
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 'var(--radius-md)',
              fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              marginBottom: 2, transition: 'all .12s', textDecoration: 'none',
            })}
          >
            <i className={`ti ti-${item.icon}`} style={{ fontSize: 17 }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ margin: '0 10px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--green-700)',
          }}>
            {usuario?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nombre || 'Usuario'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              Plan {usuario?.plan || 'básico'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
