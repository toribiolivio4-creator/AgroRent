import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { ingresosAPI, lotesAPI } from '../services/api'
import AppShell from '../components/layout/AppShell'
import Modal from '../components/ui/Modal'

const fmt = n => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n)
const EMPTY = { lote_id:'', fecha: new Date().toISOString().split('T')[0], toneladas:'', precio_por_tonelada:'', comprador:'', notas:'' }

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState([])
  const [lotes, setLotes] = useState([])
  const [filtroLote, setFiltroLote] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const cargar = (loteId) =>
    ingresosAPI.listar(loteId || undefined).then(r => setIngresos(r.data)).finally(() => setLoading(false))

  useEffect(() => {
    lotesAPI.listar().then(r => {
      setLotes(r.data)
      if (r.data.length > 0) setForm(f => ({ ...f, lote_id: r.data[0].id }))
    })
    cargar()
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const abrirCrear = () => {
    setForm({ ...EMPTY, lote_id: lotes[0]?.id || '' })
    setEditando(null); setError(''); setModal(true)
  }
  const abrirEditar = (i) => {
    setForm({ lote_id: i.lote_id, fecha: i.fecha, toneladas: i.toneladas, precio_por_tonelada: i.precio_por_tonelada, comprador: i.comprador||'', notas: i.notas||'' })
    setEditando(i); setError(''); setModal(true)
  }

  const guardar = async () => {
    if (!form.lote_id || !form.toneladas || !form.precio_por_tonelada) { setError('Lote, toneladas y precio son obligatorios'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, lote_id: parseInt(form.lote_id), toneladas: parseFloat(form.toneladas), precio_por_tonelada: parseFloat(form.precio_por_tonelada) }
      if (editando) await ingresosAPI.actualizar(editando.id, payload)
      else await ingresosAPI.crear(payload)
      await cargar(filtroLote)
      setModal(false)
    } catch (e) { setError(e.response?.data?.detail || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await ingresosAPI.eliminar(id)
    setIngresos(i => i.filter(x => x.id !== id))
  }

  const filtrar = (loteId) => { setFiltroLote(loteId); setLoading(true); cargar(loteId || undefined) }

  const total = ingresos.reduce((s, i) => s + i.total, 0)
  const totalTn = ingresos.reduce((s, i) => s + i.toneladas, 0)

  // Subtotal preview
  const subTotal = form.toneladas && form.precio_por_tonelada
    ? parseFloat(form.toneladas) * parseFloat(form.precio_por_tonelada)
    : null

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <div className="topbar-title">Ingresos</div>
          <div className="topbar-sub">{fmt(total)} · {totalTn.toFixed(1)} tn</div>
        </div>
        <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
          <select
            value={filtroLote}
            onChange={e => filtrar(e.target.value)}
            style={{ padding:'8px 12px', border:'1px solid var(--wheat)', borderRadius:'var(--radius-md)', fontSize: 13, background:'white', color:'var(--soil)' }}
          >
            <option value="">Todos los lotes</option>
            {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
          <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Registrar venta</button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ textAlign:'center', padding: 60, color:'var(--clay)' }}>Cargando...</div>
        ) : ingresos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <div className="empty-state-title">Sin ventas registradas</div>
            <div className="empty-state-sub">Registrá las ventas de cada cosecha para calcular la rentabilidad.</div>
            <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Registrar primera venta</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th><th>Lote</th><th>Toneladas</th><th>Precio/tn</th>
                  <th>Comprador</th><th style={{ textAlign:'right' }}>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map(i => {
                  const lote = lotes.find(l => l.id === i.lote_id)
                  return (
                    <tr key={i.id}>
                      <td className="mono" style={{ fontSize: 12, color:'var(--clay)' }}>
                        {new Date(i.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{lote?.nombre || `Lote #${i.lote_id}`}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{i.toneladas} tn</td>
                      <td className="mono" style={{ fontSize: 12 }}>{fmt(i.precio_por_tonelada)}</td>
                      <td style={{ fontSize: 12, color:'var(--clay)' }}>{i.comprador || '-'}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontWeight: 600, color:'var(--green)' }}>
                        +{fmt(i.total)}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap: 6, justifyContent:'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(i)}><Pencil size={11} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => eliminar(i.id)}><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editando ? 'Editar venta' : 'Registrar venta'} onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Lote *</label>
                <select value={form.lote_id} onChange={set('lote_id')}>
                  {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha *</label>
                <input type="date" value={form.fecha} onChange={set('fecha')} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Toneladas *</label>
                <input type="number" value={form.toneladas} onChange={set('toneladas')} placeholder="0.0" min="0.01" step="0.01" />
              </div>
              <div className="form-group">
                <label>Precio por tonelada ($) *</label>
                <input type="number" value={form.precio_por_tonelada} onChange={set('precio_por_tonelada')} placeholder="0" min="0" step="1" />
              </div>
            </div>
            {subTotal !== null && (
              <div style={{ background:'var(--sage)', borderRadius: 8, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize: 13, color:'var(--green)' }}>Total de la venta</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize: 16, fontWeight: 600, color:'var(--green)' }}>{fmt(subTotal)}</span>
              </div>
            )}
            <div className="form-group">
              <label>Comprador / Acopio</label>
              <input value={form.comprador} onChange={set('comprador')} placeholder="Ej: Acopio Los Alamos" />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={form.notas} onChange={set('notas')} placeholder="Opcional..." rows={2} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar venta'}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
