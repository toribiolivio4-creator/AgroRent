import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { gastosAPI, lotesAPI } from '../services/api'
import AppShell from '../components/layout/AppShell'
import Modal from '../components/ui/Modal'

const CATEGORIAS = ['semillas','fertilizantes','herbicidas','fungicidas','combustible','mano_de_obra','arrendamiento','maquinaria','otros']
const fmt = n => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(n)
const EMPTY = { lote_id:'', fecha: new Date().toISOString().split('T')[0], categoria:'semillas', descripcion:'', importe:'', notas:'' }

export default function GastosPage() {
  const [gastos, setGastos] = useState([])
  const [lotes, setLotes] = useState([])
  const [filtroLote, setFiltroLote] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const cargar = (loteId) =>
    gastosAPI.listar(loteId || undefined).then(r => setGastos(r.data)).finally(() => setLoading(false))

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
  const abrirEditar = (g) => {
    setForm({ lote_id: g.lote_id, fecha: g.fecha, categoria: g.categoria, descripcion: g.descripcion||'', importe: g.importe, notas: g.notas||'' })
    setEditando(g); setError(''); setModal(true)
  }

  const guardar = async () => {
    if (!form.lote_id || !form.importe) { setError('Lote e importe son obligatorios'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, lote_id: parseInt(form.lote_id), importe: parseFloat(form.importe) }
      if (editando) await gastosAPI.actualizar(editando.id, payload)
      else await gastosAPI.crear(payload)
      await cargar(filtroLote)
      setModal(false)
    } catch (e) { setError(e.response?.data?.detail || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await gastosAPI.eliminar(id)
    setGastos(g => g.filter(x => x.id !== id))
  }

  const filtrar = (loteId) => { setFiltroLote(loteId); setLoading(true); cargar(loteId || undefined) }

  const total = gastos.reduce((s, g) => s + g.importe, 0)

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <div className="topbar-title">Gastos</div>
          <div className="topbar-sub">Total: {fmt(total)}</div>
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
          <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Registrar gasto</button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ textAlign:'center', padding: 60, color:'var(--clay)' }}>Cargando...</div>
        ) : gastos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Sin gastos registrados</div>
            <div className="empty-state-sub">Cargá los gastos de cada lote para calcular la rentabilidad real.</div>
            <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Registrar primer gasto</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th><th>Lote</th><th>Categoría</th><th>Descripción</th>
                  <th style={{ textAlign:'right' }}>Importe</th><th></th>
                </tr>
              </thead>
              <tbody>
                {gastos.map(g => {
                  const lote = lotes.find(l => l.id === g.lote_id)
                  return (
                    <tr key={g.id}>
                      <td className="mono" style={{ fontSize: 12, color:'var(--clay)' }}>
                        {new Date(g.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{lote?.nombre || `Lote #${g.lote_id}`}</td>
                      <td>
                        <span style={{ fontSize: 12, color:'var(--earth)', textTransform:'capitalize', background:'var(--cream)', padding:'2px 8px', borderRadius: 99 }}>
                          {g.categoria.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ color:'var(--clay)', fontSize: 12 }}>{g.descripcion || '-'}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontWeight: 600, color:'var(--red)' }}>
                        -{fmt(g.importe)}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap: 6, justifyContent:'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(g)}><Pencil size={11} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => eliminar(g.id)}><Trash2 size={11} /></button>
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
        <Modal title={editando ? 'Editar gasto' : 'Registrar gasto'} onClose={() => setModal(false)}>
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
                <label>Categoría</label>
                <select value={form.categoria} onChange={set('categoria')}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Fecha *</label>
                <input type="date" value={form.fecha} onChange={set('fecha')} />
              </div>
              <div className="form-group">
                <label>Importe ($) *</label>
                <input type="number" value={form.importe} onChange={set('importe')} placeholder="0" min="0" step="0.01" />
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input value={form.descripcion} onChange={set('descripcion')} placeholder="Ej: Semilla Soja RR1 — 50 bolsas" />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={form.notas} onChange={set('notas')} placeholder="Opcional..." rows={2} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar gasto'}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
