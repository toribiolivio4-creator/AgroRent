import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Map, TrendingDown, TrendingUp, Award, LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { group: 'Principal', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Mis lotes', icon: Map, path: '/lotes' },
  ]},
  { group: 'Registros', items: [
    { label: 'Gastos', icon: TrendingDown, path: '/gastos' },
    { label: 'Ingresos', icon: TrendingUp, path: '/ingresos' },
  ]},
  { group: 'Análisis', items: [
    { label: 'Ranking', icon: Award, path: '/ranking' },
  ]},
]

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initiales = usuario?.nombre?.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-name">Agro<span>Rent</span></div>
        <div className="logo-tagline">Rentabilidad por lote</div>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map(group => (
          <div key={group.group}>
            <div className="nav-section-label">{group.group}</div>
            {group.items.map(item => (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initiales}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-info-name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {usuario?.nombre}
            </div>
            <div className="user-info-plan">{usuario?.plan}</div>
          </div>
          <button
            onClick={logout}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.35)', padding:'2px' }}
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
