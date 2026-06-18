import React from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, fontFamily: 'var(--font-ui)', fontWeight: 500,
    borderRadius: 'var(--radius-md)', transition: 'all .15s',
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  },
}

const variantMap = {
  primary:   { background: 'var(--accent)', color: '#fff' },
  secondary: { background: 'var(--stone-100)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  ghost:     { background: 'transparent', color: 'var(--text-secondary)' },
  danger:    { background: 'var(--red-100)', color: 'var(--red-500)' },
}

const sizeMap = {
  sm: { padding: '6px 12px', fontSize: 13 },
  md: { padding: '9px 16px', fontSize: 14 },
  lg: { padding: '12px 22px', fontSize: 15 },
}

export const Button: React.FC<Props> = ({
  variant = 'primary', size = 'md', loading, icon, children, style, disabled, ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    style={{
      ...styles.base,
      ...variantMap[variant],
      ...sizeMap[size],
      opacity: (disabled || loading) ? 0.6 : 1,
      ...style,
    }}
  >
    {loading
      ? <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} />
      : icon && <i className={`ti ti-${icon}`} />
    }
    {children}
  </button>
)
