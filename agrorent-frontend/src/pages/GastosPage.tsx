import React, { useEffect, useState } from 'react'
import { gastosApi, lotesApi } from '../services/api'
import { Gasto, Lote, CATEGORIAS_GASTO, CATEGORIA_LABELS } from '../types'
import { Card, EmptyState } from '../components/ui/Cards'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { formatFecha, formatPesoFull } from '../utils'

const GastoForm: React.FC<{
  lotes: Lote[]
  initial?: Partial<Gasto>
  onSave: (data: Partial<Gasto>) => Promise<void>
  onClose: () => void
  loading: boolean
}> = ({ lotes, initial = {}, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    lote_id: initial.lote_id || lotes[0]?.id || '',
    fecha: initial.fecha || new Date().toISOString().split('T')[0],
    categoria: initial.categoria || 'semillas',
    descripcion: initial.descripcion || '',
    importe: initial.importe || '',
  })
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, lote_id: Number(form.lote_id), importe: Number(form.importe) }) }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Lote</label>
          <select value={form.lote_id} onChange={(e) => set('lote_id', e.target.value)} required>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Categoría</label>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
            {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Fecha</label>
          <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Importe ($)</label>
          <input type="number" min="0" step="0.01" value={form.importe} onChange={(e) => set('importe', e.target.value)} required placeholder="0" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Descripción (opcional)</label>
          <input value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Ej: Semilla soja RR1 50kg" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={loading} icon="check">Guardar gasto</Button>
      </div>
    </form>
  )
}

export const GastosPage: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [filtroLote, setFiltroLote] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<'nuevo' | Gasto | null>(null)

  const cargar = async () => {
    const [g, l] = await Promise.all([gastosApi.listar(filtroLote), lotesApi.listar()])
    setGastos(g.data); setLotes(l.data)
    setLoading(false)
  }
  useEffect(() => { cargar() }, [filtroLote])

  const guardar = async (data: Partial<Gasto>) => {
    setSaving(true)
    try {
      if (typeof modal === 'object' && modal !== null && 'id' in modal) {
        await gastosApi.actualizar(modal.id, data)
      } else {
        await gastosApi.crear(data)
      }
      await cargar(); setModal(null)
    } finally { setSaving(false) }
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await gastosApi.eliminar(id); cargar()
  }

  const total = gastos.reduce((s, g) => s + g.importe, 0)
  const loteMap = Object.fromEntries(lotes.map((l) => [l.id, l.nombre]))

  return (
    <div className="animate-in">
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Gastos</div>
          {gastos.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {gastos.length} registros · Total: <strong>{formatPesoFull(total)}</strong>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={filtroLote || ''}
            onChange={(e) => setFiltroLote(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 160, fontSize: 13, padding: '7px 10px' }}
          >
            <option value="">Todos los lotes</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <Button icon="plus" onClick={() => setModal('nuevo')}>Registrar gasto</Button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {loading ? <div style={{ color: 'var(--text-secondary)' }}>Cargando...</div>
          : gastos.length === 0 ? (
            <EmptyState icon="receipt" message="No hay gastos registrados aún." action={
              <Button icon="plus" onClick={() => setModal('nuevo')}>Registrar primer gasto</Button>
            } />
          ) : (
            <Card style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--stone-50)' }}>
                    {['Fecha', 'Lote', 'Categoría', 'Descripción', 'Importe', ''].map((h) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left', fontWeight: 500,
                        fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase',
                        letterSpacing: '0.5px', borderBottom: '1px solid var(--border)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatFecha(g.fecha)}</td>
                      <td style={{ padding: '12px 16px' }}>{loteMap[g.lote_id] || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: 'var(--green-100)', color: 'var(--green-700)',
                          padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                        }}>
                          {CATEGORIA_LABELS[g.categoria] || g.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{g.descripcion || '—'}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                        {formatPesoFull(g.importe)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => setModal(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                            <i className="ti ti-pencil" style={{ fontSize: 14 }} />
                          </button>
                          <button onClick={() => eliminar(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                            <i className="ti ti-trash" style={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={typeof modal === 'object' && modal !== null && 'id' in modal ? 'Editar gasto' : 'Registrar gasto'}
      >
        {lotes.length === 0
          ? <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Primero creá un lote para poder registrar gastos.</p>
          : <GastoForm
              lotes={lotes}
              initial={typeof modal === 'object' && modal !== null && 'id' in modal ? modal : {}}
              onSave={guardar}
              onClose={() => setModal(null)}
              loading={saving}
            />
        }
      </Modal>
    </div>
  )
}
