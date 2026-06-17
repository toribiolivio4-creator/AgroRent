import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { rentabilidadAPI } from '../services/api'
import AppShell from '../components/layout/AppShell'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits: 0 }).format(n)
const fmtM = (n) => `$${(n/1_000_000).toFixed(1)}M`

const CULTIVO_COLORS = { soja:'#5A9B5F', maiz:'#C9A96E', trigo:'#4A8BC4', girasol:'#E0A020', default:'#8B5E3C' }
const cultivoColor = (c) => CULTIVO_COLORS[c?.toLowerCase()] || CULTIVO_COLORS.default

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'white', border:'1px solid var(--wheat)', borderRadius: 8, padding:'10px 14px', boxShadow:'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color:'var(--soil)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display:'flex', gap: 8, alignItems:'center' }}>
          <span style={{ width: 8, height: 8, borderRadius:'50%', background: p.color, display:'inline-block' }} />
          {p.name}: {fmtM(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentabilidadAPI.dashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppShell>
      <div className="loading-screen" style={{ height:'100%' }}>
        <div className="loading-spinner" />
        <span style={{ color:'var(--clay)', fontSize: 13 }}>Calculando rentabilidad...</span>
      </div>
    </AppShell>
  )

  if (!data || data.lotes_activos === 0) return (
    <AppShell>
      <div className="topbar">
        <div><div className="topbar-title">Dashboard</div></div>
      </div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <div className="empty-state-title">Todavía no hay datos</div>
          <div className="empty-state-sub">Creá tu primer lote y empezá a cargar gastos e ingresos para ver el análisis de rentabilidad.</div>
        </div>
      </div>
    </AppShell>
  )

  const chartData = data.ranking.map(r => ({
    name: r.nombre,
    Inversión: r.total_gastos,
    Ingresos: r.total_ingresos,
    Ganancia: r.ganancia,
    cultivo: r.cultivo,
  }))

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard general</div>
          <div className="topbar-sub">{data.lotes_activos} lote{data.lotes_activos !== 1 ? 's' : ''} activos · Campaña actual</div>
        </div>
      </div>

      <div className="page-content">
        {/* Métricas */}
        <div className="metrics-grid">
          <div className="metric-card soil">
            <div className="metric-label">Inversión total</div>
            <div className="metric-value">{fmtM(data.total_gastos)}</div>
            <div className="metric-sub">{data.lotes_activos} lotes</div>
          </div>
          <div className="metric-card amber">
            <div className="metric-label">Ingresos totales</div>
            <div className="metric-value">{fmtM(data.total_ingresos)}</div>
            <div className="metric-sub">{data.total_hectareas} ha</div>
          </div>
          <div className="metric-card green">
            <div className="metric-label">Ganancia neta</div>
            <div className={`metric-value ${data.ganancia_neta >= 0 ? 'pos' : 'neg'}`}>{fmtM(data.ganancia_neta)}</div>
            <div className="metric-sub">Margen {data.margen_global.toFixed(1)}%</div>
          </div>
          <div className="metric-card amber">
            <div className="metric-label">Mejor lote</div>
            <div className="metric-value" style={{ fontSize: 18, marginTop: 4, color:'var(--amber)' }}>{data.mejor_lote}</div>
            <div className="metric-sub">{data.ranking[0] ? fmt(data.ranking[0].ganancia_por_ha) + '/ha' : '-'}</div>
          </div>
        </div>

        {/* Tabla ranking + Gráfico */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap: 16, marginBottom: 24 }}>
          <div>
            <div className="section-hdr">
              <div className="section-title">Rentabilidad por lote</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Lote</th><th>Cultivo</th><th>Ha</th>
                    <th>Inversión</th><th>Ingresos</th><th>Ganancia</th>
                    <th>$/ha</th><th>Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ranking.map(r => (
                    <tr key={r.lote_id}>
                      <td><div className={`rank-badge rank-${r.ranking}`}>{r.ranking}</div></td>
                      <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                      <td><span className={`tag tag-${r.cultivo.toLowerCase()}`}>{r.cultivo}</span></td>
                      <td className="mono">{r.hectareas}</td>
                      <td className="mono" style={{ color:'var(--clay)', fontSize: 12 }}>{fmtM(r.total_gastos)}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{fmtM(r.total_ingresos)}</td>
                      <td className={r.ganancia >= 0 ? 'profit-pos' : 'profit-neg'}>{fmtM(r.ganancia)}</td>
                      <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{fmt(r.ganancia_por_ha)}</td>
                      <td>
                        <span style={{
                          background: r.margen_porcentaje >= 40 ? 'var(--sage)' : r.margen_porcentaje >= 20 ? 'var(--amber-l)' : 'var(--red-l)',
                          color: r.margen_porcentaje >= 40 ? 'var(--green)' : r.margen_porcentaje >= 20 ? 'var(--amber)' : 'var(--red)',
                          padding:'2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600
                        }}>
                          {r.margen_porcentaje.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="section-hdr">
              <div className="section-title">Inversión vs Ingresos</div>
            </div>
            <div className="card card-pad" style={{ height: 'calc(100% - 36px)' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill:'var(--clay)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtM} tick={{ fontSize: 11, fill:'var(--clay)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Inversión" fill="#C9A96E" radius={[4,4,0,0]} />
                  <Bar dataKey="Ingresos" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={cultivoColor(entry.cultivo)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Gastos por categoría del lote #1 */}
              {data.ranking[0]?.gastos_por_categoria && (
                <div style={{ marginTop: 16, borderTop:'1px solid var(--wheat)', paddingTop: 14 }}>
                  <div style={{ fontSize: 11, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    Gastos — {data.ranking[0].nombre}
                  </div>
                  {Object.entries(data.ranking[0].gastos_por_categoria).map(([cat, val]) => (
                    <div key={cat} style={{ display:'flex', justifyContent:'space-between', fontSize: 12, padding:'4px 0', borderBottom:'1px solid var(--fog)', color:'var(--earth)' }}>
                      <span style={{ textTransform:'capitalize' }}>{cat.replace(/_/g, ' ')}</span>
                      <span className="mono" style={{ fontSize: 11 }}>{fmt(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
