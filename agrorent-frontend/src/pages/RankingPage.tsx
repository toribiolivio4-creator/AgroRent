import React, { useEffect, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { rentabilidadApi } from '../services/api'
import { Dashboard, RentabilidadLote, CATEGORIA_LABELS } from '../types'
import { Card, EmptyState } from '../components/ui/Cards'
import { formatPeso, formatPesoFull } from '../utils'

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_BG = ['#fef3c7', '#f3f4f6', '#fdf2e9']
const MEDAL_BORDER = ['#fcd34d', '#d1d5db', '#e5b47a']

const RankCard: React.FC<{ r: RentabilidadLote; selected: boolean; onClick: () => void }> = ({ r, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px',
      background: selected ? 'var(--green-50)' : 'var(--bg-card)',
      cursor: 'pointer', transition: 'all .15s',
      boxShadow: selected ? '0 0 0 3px rgba(29,158,117,.12)' : 'var(--shadow-sm)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-md)',
        background: r.ranking <= 3 ? MEDAL_BG[r.ranking - 1] : 'var(--stone-100)',
        border: `1px solid ${r.ranking <= 3 ? MEDAL_BORDER[r.ranking - 1] : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: r.ranking <= 3 ? 18 : 14, fontWeight: 700, fontFamily: 'var(--font-mono)',
      }}>
        {r.ranking <= 3 ? MEDALS[r.ranking - 1] : `#${r.ranking}`}
      </div>
      <div style={{
        fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 500,
        background: r.margen_porcentaje >= 40 ? 'var(--green-100)' : r.margen_porcentaje >= 20 ? 'var(--amber-100)' : 'var(--red-100)',
        color: r.margen_porcentaje >= 40 ? 'var(--green-700)' : r.margen_porcentaje >= 20 ? 'var(--amber-800)' : 'var(--red-500)',
      }}>
        {r.margen_porcentaje.toFixed(1)}% margen
      </div>
    </div>
    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>{r.nombre}</div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
      {r.cultivo} · {r.hectareas} ha · {r.campania}
    </div>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500,
      color: r.ganancia >= 0 ? 'var(--green-600)' : 'var(--red-500)',
    }}>
      {r.ganancia >= 0 ? '+' : ''}{formatPeso(r.ganancia)}
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
      {formatPeso(r.ganancia_por_ha)}/ha
    </div>
  </div>
)

const LoteDetalle: React.FC<{ r: RentabilidadLote }> = ({ r }) => {
  const radarData = [
    { metric: 'Margen', value: Math.min(r.margen_porcentaje, 100) },
    { metric: 'Ing/ha', value: Math.min((r.ingreso_por_ha / 500000) * 100, 100) },
    { metric: 'Rendimiento', value: Math.min((r.ganancia_por_ha / 200000) * 100, 100) },
    { metric: 'Eficiencia', value: r.total_gastos > 0 ? Math.min((r.ganancia / r.total_gastos) * 50, 100) : 0 },
  ]

  return (
    <Card style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--green-700)' }}>
            {r.nombre}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.cultivo} · {r.hectareas} ha</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: r.ganancia >= 0 ? 'var(--green-600)' : 'var(--red-500)' }}>
            {r.ganancia >= 0 ? '+' : ''}{formatPesoFull(r.ganancia)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ganancia total</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Inversión', value: formatPesoFull(r.total_gastos) },
          { label: 'Ingresos', value: formatPesoFull(r.total_ingresos) },
          { label: 'Costo/ha', value: formatPesoFull(r.costo_por_ha) },
          { label: 'Ingreso/ha', value: formatPesoFull(r.ingreso_por_ha) },
          { label: 'Ganancia/ha', value: formatPesoFull(r.ganancia_por_ha) },
          { label: 'Margen', value: `${r.margen_porcentaje.toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--stone-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Gastos por categoría */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Gastos por categoría</div>
          {Object.entries(r.gastos_por_categoria)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, val]) => {
              const pct = r.total_gastos > 0 ? (val / r.total_gastos) * 100 : 0
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {CATEGORIA_LABELS[cat] || cat}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPeso(val)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--stone-100)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width .5s ease' }} />
                  </div>
                </div>
              )
            })}
        </div>

        {/* Radar */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Perfil de rendimiento</div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

export const RankingPage: React.FC = () => {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number>(0)

  useEffect(() => {
    rentabilidadApi.dashboard()
      .then((r) => { setData(r.data); if (r.data.ranking.length > 0) setSelected(r.data.ranking[0].lote_id) })
      .finally(() => setLoading(false))
  }, [])

  const selectedLote = data?.ranking.find((r) => r.lote_id === selected)

  return (
    <div className="animate-in">
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Ranking de rentabilidad</div>
        {data && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {data.lotes_activos} lotes · Ganancia global: <strong style={{ color: 'var(--green-600)', fontFamily: 'var(--font-mono)' }}>+{formatPesoFull(data.ganancia_neta)}</strong>
        </div>}
      </div>

      <div style={{ padding: '24px 28px' }}>
        {loading ? <div style={{ color: 'var(--text-secondary)' }}>Calculando rentabilidad...</div>
          : !data || data.ranking.length === 0 ? (
            <EmptyState icon="award" message="Cargá lotes, gastos e ingresos para ver el ranking." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
              {/* Lista ranking */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.ranking.map((r) => (
                  <RankCard
                    key={r.lote_id} r={r}
                    selected={selected === r.lote_id}
                    onClick={() => setSelected(r.lote_id)}
                  />
                ))}
              </div>

              {/* Detalle del seleccionado */}
              {selectedLote && <LoteDetalle r={selectedLote} />}
            </div>
          )}
      </div>
    </div>
  )
}
