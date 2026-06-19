import React from 'react'
import { useThemeStore } from '../../store/theme'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all .15s',
        lineHeight: 1,
      }}
    >
      <i className={`ti ti-${isDark ? 'sun' : 'moon'}`} style={{ fontSize: 18 }} />
    </button>
  )
}
