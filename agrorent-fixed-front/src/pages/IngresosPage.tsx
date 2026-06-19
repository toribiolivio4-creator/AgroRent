import React, { useEffect, useState } from 'react'
import { ingresosApi, lotesApi } from '../services/api'
import { Ingreso, Lote } from '../types'
import { Card, EmptyState } from '../components/ui/Cards'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { formatFecha, formatPesoFull } from '../utils'

const IngresoForm: React.FC<{
  lotes: Lote[]
  initial?: Partial<Ingreso>
  onSave: (data: object) => Promise<void>
  onClose: () => void
  loading: boolean
}> = ({ lotes, initial = {}, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    lote_id: initial.lote_id || lotes[0]?.id || '',
    fecha: initial.fecha || new Date().toISOString().split('T')[0],
    toneladas: initial.toneladas || '',
    precio_por_tonelada: initial.precio_por_tonelada || '',
    comprador: initial.comprador || '',
  })
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))
  const total = Number(form.toneladas) * Number(form.precio_por_tonelada)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, lote_id: Number(form.lote_id), toneladas: Number(form.toneladas), precio_por_tonelada: Number(form.precio_por_tonelada) }) }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Lote</label>
          <select value={form.lote_id} onChange={(e) => set('lote_id', e.target.value)} required>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Fecha de venta</label>
          <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Toneladas</label>
          <input type="number" min="0" step="0.01" value={form.toneladas} onChange={(e) => set('toneladas', e.target.value)} required placeholder="0.0" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Precio por tonelada ($)</label>
          <input type="number" min="0" step="0.01" value={form.precio_por_tonelada} onChange={(e) => set('precio_por_tonelada', e.target.value)} required placeholder="0" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Comprador / acopio (opcional)</label>
          <input value={form.comprador} onChange={(e) => set('comprador', e.target.value)} placeholder="Ej: Acopio Los Álamos" />
        </div>
      </div>
      {total > 0 && (
        <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
          Total de la venta: <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatPesoFull(total)}</strong>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={loading} icon="check">Guardar venta</Button>
      </div>
    </form>
  )
}

export const IngresosPage: React.FC = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [filtroLote, setFiltroLote] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<'nuevo' | Ingreso | null>(null)

  const cargar = async () => {
    const [i, l] = await Promise.all([ingresosApi.listar(filtroLote), lotesApi.listar()])
    setIngresos(i.data); setLotes(l.data); setLoading(false)
  }
  useEffect(() => { cargar() }, [filtroLote])

  const guardar = async (data: object) => {
    setSaving(true)
    try {
      if (typeof modal === 'object' && modal !== null && 'id' in modal) {
        await ingresosApi.actualizar((modal as Ingreso).id, data)
      } else {
        await ingresosApi.crear(data)
      }
      await cargar(); setModal(null)
    } finally { setSaving(false) }
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await ingresosApi.eliminar(id); cargar()
  }

  const total = ingresos.reduce((s, i) => s + i.total, 0)
  const loteMap = Object.fromEntries(lotes.map((l) => [l.id, l.nombre]))

  return (
    <div className="animate-in">
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Ingresos</div>
          {ingresos.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {ingresos.length} ventas · Total: <strong>{formatPesoFull(total)}</strong>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={filtroLote || ''} onChange={(e) => setFiltroLote(e.target.value ? Number(e.target.value) : undefined)} style={{ width: 160, fontSize: 13, padding: '7px 10px' }}>
            <option value="">Todos los lotes</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <Button icon="plus" onClick={() => setModal('nuevo')}>Registrar venta</Button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {loading ? <div style={{ color: 'var(--text-secondary)' }}>Cargando...</div>
          : ingresos.length === 0 ? (
            <EmptyState icon="cash" message="No hay ventas registradas aún." action={
              <Button icon="plus" onClick={() => setModal('nuevo')}>Registrar primera venta</Button>
            } />
          ) : (
            <Card style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--stone-50)' }}>
                    {['Fecha', 'Lote', 'Toneladas', 'Precio/tn', 'Total', 'Comprador', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map((i) => (
                    <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatFecha(i.fecha)}</td>
                      <td style={{ padding: '12px 16px' }}>{loteMap[i.lote_id] || '-'}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{i.toneladas.toFixed(1)} tn</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{formatPesoFull(i.precio_por_tonelada)}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--green-600)' }}>
                        {formatPesoFull(i.total)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{i.comprador || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => setModal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><i className="ti ti-pencil" style={{ fontSize: 14 }} /></button>
                          <button onClick={() => eliminar(i.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><i className="ti ti-trash" style={{ fontSize: 14 }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={typeof modal === 'object' && modal !== null && 'id' in modal ? 'Editar venta' : 'Registrar venta'}>
        {lotes.length === 0
          ? <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Primero creá un lote para poder registrar ingresos.</p>
          : <IngresoForm lotes={lotes} initial={typeof modal === 'object' && modal !== null && 'id' in modal ? modal as Ingreso : {}} onSave={guardar} onClose={() => setModal(null)} loading={saving} />
        }
      </Modal>
    </div>
  )
}
