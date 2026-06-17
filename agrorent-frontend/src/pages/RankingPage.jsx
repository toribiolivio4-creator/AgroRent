import { useEffect, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { rentabilidadAPI } from '../services/api'
import AppShell from '../components/layout/AppShell'

const fmt = n => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n)
const fmtM = n => `$${(n/1_000_000).toFixed(2)}M`

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_CLASSES = ['gold', 'silver', 'bronze']

export default function RankingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentabilidadAPI.dashboard().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppShell>
      <div className="topbar"><div className="topbar-title">Ranking de rentabilidad</div></div>
      <div className="page-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', height: 300 }}>
        <div className="loading-spinner" />
      </div>
    </AppShell>
  )

  if (!data || data.lotes_activos === 0) return (
    <AppShell>
      <div className="topbar"><div className="topbar-title">Ranking de rentabilidad</div></div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">Sin datos todavía</div>
          <div className="empty-state-sub">Cargá gastos e ingresos en tus lotes para ver el ranking de rentabilidad.</div>
        </div>
      </div>
    </AppShell>
  )

  const top3 = data.ranking.slice(0, 3)
  const maxGananciaHa = Math.max(...data.ranking.map(r => r.ganancia_por_ha))

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <div className="topbar-title">Ranking de rentabilidad</div>
          <div className="topbar-sub">Ordenado por ganancia/ha — el indicador más justo entre lotes de diferente tamaño</div>
        </div>
      </div>

      <div className="page-content">
        {/* Podium */}
        <div className="podium">
          {top3.map((r, i) => (
            <div key={r.lote_id} className={`podium-card ${PODIUM_CLASSES[i]}`}>
              <div className="podium-medal">{MEDALS[i]}</div>
              <div className="podium-rank">{i === 0 ? 'Campeón' : i === 1 ? '2do lugar' : '3er lugar'}</div>
              <div className="podium-name">{r.nombre}</div>
              <div className="podium-meta">{r.hectareas} ha · {r.cultivo}</div>
              <div className="podium-value">{fmt(r.ganancia_por_ha)}</div>
              <div className="podium-value-label">por hectárea</div>
              <div style={{ marginTop: 12, display:'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1 }}>Ganancia</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 14, color:'var(--green)', fontWeight: 600 }}>{fmtM(r.ganancia)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1 }}>Margen</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 14, fontWeight: 600, color: r.margen_porcentaje >= 40 ? 'var(--green)' : 'var(--amber)' }}>
                    {r.margen_porcentaje.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla completa */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap: 16 }}>
          <div>
            <div className="section-hdr">
              <div className="section-title">Tabla completa</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Lote</th><th>Cultivo</th><th>Ha</th>
                    <th>Costo/ha</th><th>Ingreso/ha</th><th>Margen</th>
                    <th>Ganancia total</th><th>Comparativa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ranking.map(r => (
                    <tr key={r.lote_id}>
                      <td><div className={`rank-badge rank-${r.ranking}`}>{r.ranking}</div></td>
                      <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                      <td><span className={`tag tag-${r.cultivo.toLowerCase()}`}>{r.cultivo}</span></td>
                      <td className="mono">{r.hectareas}</td>
                      <td className="mono" style={{ fontSize: 12, color:'var(--clay)' }}>{fmt(r.costo_por_ha)}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{fmt(r.ingreso_por_ha)}</td>
                      <td>
                        <span style={{
                          background: r.margen_porcentaje >= 40 ? 'var(--sage)' : r.margen_porcentaje >= 20 ? 'var(--amber-l)' : 'var(--red-l)',
                          color: r.margen_porcentaje >= 40 ? 'var(--green)' : r.margen_porcentaje >= 20 ? 'var(--amber)' : 'var(--red)',
                          padding:'2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600
                        }}>
                          {r.margen_porcentaje.toFixed(1)}%
                        </span>
                      </td>
                      <td className={r.ganancia >= 0 ? 'profit-pos' : 'profit-neg'} style={{ fontWeight: 600 }}>
                        {r.ganancia >= 0 ? '+' : ''}{fmtM(r.ganancia)}
                      </td>
                      <td>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${maxGananciaHa > 0 ? (r.ganancia_por_ha / maxGananciaHa) * 100 : 0}%`,
                              background: r.ranking === 1 ? 'var(--green)' : r.ranking === 2 ? 'var(--straw)' : 'var(--clay)'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen global */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              {[
                { label:'Total invertido', value: fmtM(data.total_gastos), color:'var(--red)' },
                { label:'Total ingresado', value: fmtM(data.total_ingresos), color:'var(--green)' },
                { label:'Ganancia neta', value: fmtM(data.ganancia_neta), color: data.ganancia_neta >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map(m => (
                <div key={m.label} className="card card-pad" style={{ textAlign:'center' }}>
                  <div style={{ fontSize: 11, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 20, fontWeight: 600, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar chart por cultivo */}
          <div>
            <div className="section-hdr"><div className="section-title">Perfil de rentabilidad</div></div>
            <div className="card card-pad">
              {data.ranking.length >= 3 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={data.ranking.map(r => ({
                    lote: r.nombre,
                    'Ganancia/ha': Math.max(0, r.ganancia_por_ha / 1000),
                    'Margen %': r.margen_porcentaje,
                    'Ingreso/ha': r.ingreso_por_ha / 1000,
                  }))}>
                    <PolarGrid stroke="var(--wheat)" />
                    <PolarAngleAxis dataKey="lote" tick={{ fontSize: 11, fill:'var(--clay)' }} />
                    <Radar name="Ganancia/ha (miles)" dataKey="Ganancia/ha" stroke="var(--green)" fill="var(--green)" fillOpacity={0.2} />
                    <Tooltip formatter={(v, n) => [v.toFixed(1), n]} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 20, textAlign:'center', color:'var(--clay)', fontSize: 13 }}>
                  Se necesitan 3+ lotes para el gráfico radar.
                </div>
              )}

              <div style={{ borderTop:'1px solid var(--wheat)', paddingTop: 14, marginTop: 8 }}>
                <div style={{ fontSize: 12, color:'var(--clay)', marginBottom: 10 }}>Gastos por categoría — todos los lotes</div>
                {(() => {
                  const cats = {}
                  data.ranking.forEach(r => Object.entries(r.gastos_por_categoria).forEach(([k,v]) => cats[k] = (cats[k]||0)+v))
                  const total = Object.values(cats).reduce((a,b) => a+b, 0)
                  return Object.entries(cats)
                    .sort((a,b) => b[1]-a[1])
                    .map(([cat, val]) => (
                      <div key={cat} style={{ marginBottom: 8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize: 12, marginBottom: 3 }}>
                          <span style={{ color:'var(--earth)', textTransform:'capitalize' }}>{cat.replace(/_/g,' ')}</span>
                          <span className="mono" style={{ fontSize: 11 }}>{fmt(val)} ({total > 0 ? ((val/total)*100).toFixed(0) : 0}%)</span>
                        </div>
                        <div className="bar-track" style={{ width:'100%' }}>
                          <div className="bar-fill" style={{ width: `${total > 0 ? (val/total)*100 : 0}%`, background:'var(--straw)' }} />
                        </div>
                      </div>
                    ))
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
