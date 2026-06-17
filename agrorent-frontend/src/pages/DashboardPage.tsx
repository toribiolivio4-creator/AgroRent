import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { rentabilidadApi } from '../services/api'
import { Dashboard } from '../types'
import { StatCard, Card, SectionTitle, EmptyState } from '../components/ui/Cards'
import { formatPeso, formatPesoFull } from '../utils'

const CULTIVO_COLORS: Record<string, string> = {
  Soja: '#1d9e75', Maíz: '#e5a227', Trigo: '#378ADD',
  Girasol: '#e8b84b', Sorgo: '#a05c3b',
}
const getColor = (c: string) => CULTIVO_COLORS[c] || '#8a8880'

const TopBar: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div style={{
    padding: '18px 28px', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
  }}>
    <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>}
  </div>
)

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentabilidadApi.dashboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <TopBar title="Dashboard" />
      <div style={{ padding: 28, color: 'var(--text-secondary)', fontSize: 14 }}>Cargando...</div>
    </div>
  )

  if (!data || data.lotes_activos === 0) return (
    <div>
      <TopBar title="Dashboard" />
      <EmptyState icon="plant-2" message="Todavía no cargaste ningún lote. ¡Empezá creando el primero!" />
    </div>
  )

  const chartData = data.ranking.map((r) => ({
    name: r.nombre,
    cultivo: r.cultivo,
    gastos: r.total_gastos,
    ingresos: r.total_ingresos,
    ganancia: r.ganancia,
  }))

  return (
    <div className="animate-in">
      <TopBar title="Dashboard" sub={`Campaña activa · ${data.lotes_activos} lotes`} />
      <div style={{ padding: '24px 28px' }}>

        {/* Métricas globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 4 }}>
          <StatCard label="Inversión total" value={formatPeso(data.total_gastos)} sub="Todos los lotes" icon="coins" />
          <StatCard label="Ingresos totales" value={formatPeso(data.total_ingresos)} sub="Ventas del período" icon="trending-up" />
          <StatCard
            label="Ganancia neta"
            value={formatPeso(data.ganancia_neta)}
            sub={`Margen ${data.margen_global.toFixed(1)}%`}
            icon="report-money"
            accent={data.ganancia_neta >= 0 ? 'var(--green-600)' : 'var(--red-500)'}
          />
          <StatCard label="Mejor lote" value={data.mejor_lote} sub="Por rentabilidad/ha" icon="award" accent="var(--amber-600)" />
        </div>

        <SectionTitle>Comparativa por lote</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Gráfico barras */}
          <Card style={{ padding: '20px 16px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Inversión vs. Ingresos</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatPeso(v)} width={70} />
                <Tooltip
                  formatter={(v: number) => formatPesoFull(v)}
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                />
                <Bar dataKey="gastos" name="Inversión" fill="var(--stone-200)" radius={[4,4,0,0]} />
                <Bar dataKey="ingresos" name="Ingresos" radius={[4,4,0,0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getColor(entry.cultivo)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Ganancia por lote */}
          <Card style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Ganancia por lote</div>
            {data.ranking.map((r, i) => (
              <div key={r.lote_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: i < data.ranking.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: i === 0 ? '#fac775' : 'var(--stone-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: i === 0 ? '#412402' : 'var(--text-secondary)',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.cultivo} · {r.hectareas} ha</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
                    color: r.ganancia >= 0 ? 'var(--green-600)' : 'var(--red-500)',
                  }}>
                    {r.ganancia >= 0 ? '+' : ''}{formatPeso(r.ganancia)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {formatPeso(r.ganancia_por_ha)}/ha
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Desglose de gastos por categoría */}
        {data.ranking.length > 0 && (
          <>
            <SectionTitle>Gastos por categoría (todos los lotes)</SectionTitle>
            <Card style={{ padding: '20px' }}>
              {(() => {
                const totalCat: Record<string, number> = {}
                data.ranking.forEach(r => {
                  Object.entries(r.gastos_por_categoria).forEach(([cat, val]) => {
                    totalCat[cat] = (totalCat[cat] || 0) + val
                  })
                })
                const total = Object.values(totalCat).reduce((a, b) => a + b, 0)
                const sorted = Object.entries(totalCat).sort((a, b) => b[1] - a[1])
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px 24px' }}>
                    {sorted.map(([cat, val]) => (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', opacity: val / total + 0.3 }} />
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {cat.replace('_', ' ')}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatPeso(val)}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
