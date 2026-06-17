import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { lotesAPI } from '../services/api'
import AppShell from '../components/layout/AppShell'
import Modal from '../components/ui/Modal'

const CULTIVOS = ['Soja', 'Maíz', 'Trigo', 'Girasol', 'Sorgo', 'Maní', 'Algodón', 'Otro']

const EMPTY = { nombre:'', hectareas:'', cultivo:'Soja', ubicacion:'', campania:'2024/25', notas:'' }

export default function LotesPage() {
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'crear' | 'editar'
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargar = () => lotesAPI.listar().then(r => setLotes(r.data)).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const abrirCrear = () => { setForm(EMPTY); setEditando(null); setError(''); setModal('form') }
  const abrirEditar = (l) => {
    setForm({ nombre:l.nombre, hectareas:l.hectareas, cultivo:l.cultivo, ubicacion:l.ubicacion||'', campania:l.campania, notas:l.notas||'' })
    setEditando(l)
    setError('')
    setModal('form')
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.hectareas) { setError('Nombre y hectáreas son obligatorios'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, hectareas: parseFloat(form.hectareas) }
      if (editando) { await lotesAPI.actualizar(editando.id, payload) }
      else { await lotesAPI.crear(payload) }
      await cargar()
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este lote? Se borrarán todos sus gastos e ingresos.')) return
    await lotesAPI.eliminar(id)
    setLotes(l => l.filter(x => x.id !== id))
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <div className="topbar-title">Mis lotes</div>
          <div className="topbar-sub">{lotes.length} lotes registrados</div>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Nuevo lote</button>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ textAlign:'center', padding: 60, color:'var(--clay)' }}>Cargando...</div>
        ) : lotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <div className="empty-state-title">Ningún lote todavía</div>
            <div className="empty-state-sub">Creá tu primer lote para empezar a registrar gastos e ingresos.</div>
            <button className="btn btn-primary" onClick={abrirCrear}><Plus size={15} /> Crear primer lote</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {lotes.map(l => (
              <div key={l.id} className="card card-pad" style={{ position:'relative' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize: 17, fontWeight: 500, color:'var(--soil)' }}>{l.nombre}</div>
                    <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 4 }}>
                      <span className={`tag tag-${l.cultivo.toLowerCase()}`}>{l.cultivo}</span>
                      <span style={{ fontSize: 11, color:'var(--clay)' }}>· {l.campania}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(l)} title="Editar"><Pencil size={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => eliminar(l.id)} title="Eliminar"><Trash2 size={12} /></button>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                  <div style={{ background:'var(--fog)', borderRadius: 8, padding:'10px 12px' }}>
                    <div style={{ fontSize: 10, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1 }}>Hectáreas</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 20, fontWeight: 500, color:'var(--soil)', marginTop: 2 }}>{l.hectareas}</div>
                  </div>
                  {l.ubicacion && (
                    <div style={{ background:'var(--fog)', borderRadius: 8, padding:'10px 12px' }}>
                      <div style={{ fontSize: 10, color:'var(--clay)', textTransform:'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ubicación</div>
                      <div style={{ fontSize: 12, color:'var(--earth)', display:'flex', alignItems:'center', gap: 4 }}>
                        <MapPin size={11} />{l.ubicacion}
                      </div>
                    </div>
                  )}
                </div>

                {l.notas && (
                  <div style={{ marginTop: 10, fontSize: 12, color:'var(--clay)', fontStyle:'italic', borderTop:'1px solid var(--wheat)', paddingTop: 10 }}>
                    {l.notas}
                  </div>
                )}
              </div>
            ))}

            {/* Add card */}
            <button
              onClick={abrirCrear}
              style={{ border:'2px dashed var(--wheat)', borderRadius:'var(--radius-lg)', padding: 28, background:'none', cursor:'pointer', color:'var(--clay)', display:'flex', flexDirection:'column', alignItems:'center', gap: 8, transition:'all .15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor='var(--clay)'}
              onMouseOut={e => e.currentTarget.style.borderColor='var(--wheat)'}
            >
              <Plus size={24} opacity={.5} />
              <span style={{ fontSize: 13 }}>Agregar lote</span>
            </button>
          </div>
        )}
      </div>

      {modal === 'form' && (
        <Modal title={editando ? 'Editar lote' : 'Nuevo lote'} onClose={() => setModal(null)}>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nombre del lote *</label>
                <input value={form.nombre} onChange={set('nombre')} placeholder="Ej: Lote Norte" />
              </div>
              <div className="form-group">
                <label>Hectáreas *</label>
                <input type="number" value={form.hectareas} onChange={set('hectareas')} placeholder="50" min="0.1" step="0.1" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cultivo</label>
                <select value={form.cultivo} onChange={set('cultivo')}>
                  {CULTIVOS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Campaña</label>
                <input value={form.campania} onChange={set('campania')} placeholder="2024/25" />
              </div>
            </div>
            <div className="form-group">
              <label>Ubicación</label>
              <input value={form.ubicacion} onChange={set('ubicacion')} placeholder="Ej: San Jorge, Santa Fe" />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={form.notas} onChange={set('notas')} placeholder="Observaciones opcionales..." rows={2} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear lote'}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
