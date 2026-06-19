import React from 'react'

// ── Card ──────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}
export const Card: React.FC<CardProps> = ({ children, style, className, onClick }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      ...(onClick ? { cursor: 'pointer' } : {}),
      ...style,
    }}
  >
    {children}
  </div>
)

// ── Badge ─────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'blue' | 'gray' | 'red'
const badgeColors: Record<BadgeVariant, { bg: string; color: string }> = {
  green: { bg: 'var(--green-100)', color: 'var(--green-700)' },
  amber: { bg: 'var(--amber-100)', color: 'var(--amber-800)' },
  blue:  { bg: '#dceefa', color: '#0c447c' },
  gray:  { bg: 'var(--stone-100)', color: 'var(--stone-700)' },
  red:   { bg: 'var(--red-100)', color: 'var(--red-500)' },
}
export const Badge: React.FC<{ label: string; variant?: BadgeVariant }> = ({
  label, variant = 'gray'
}) => {
  const c = badgeColors[variant]
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 99,
      fontSize: 12, fontWeight: 500, background: c.bg, color: c.color,
    }}>{label}</span>
  )
}

// ── StatCard ──────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: string
  accent?: string
}
export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, accent }) => (
  <Card style={{ padding: '18px 20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500,
          color: accent || 'var(--text-primary)', lineHeight: 1.1,
        }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--stone-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ti-${icon}`} style={{ fontSize: 18, color: 'var(--text-secondary)' }} />
        </div>
      )}
    </div>
  </Card>
)

// ── SectionTitle ──────────────────────────────────────
export const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 24 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
      {children}
    </div>
    {action}
  </div>
)

// ── EmptyState ────────────────────────────────────────
export const EmptyState: React.FC<{ icon?: string; message: string; action?: React.ReactNode }> = ({
  icon = 'mood-empty', message, action
}) => (
  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
    <i className={`ti ti-${icon}`} style={{ fontSize: 36, marginBottom: 12, display: 'block', opacity: .4 }} />
    <p style={{ fontSize: 14, marginBottom: action ? 16 : 0 }}>{message}</p>
    {action}
  </div>
)
