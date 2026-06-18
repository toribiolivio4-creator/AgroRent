import React, { useEffect, useState } from 'react'
import { lotesApi } from '../services/api'
import { Lote } from '../types'
import { Card, EmptyState } from '../components/ui/Cards'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

const CULTIVOS = ['Soja', 'Maíz', 'Trigo', 'Girasol', 'Sorgo', 'Otro']
const CULTIVO_ICON: Record<string, string> = {
  Soja: '🌱', Maíz: '🌽', Trigo: '🌾', Girasol: '🌻', Sorgo: '🌿', Otro: '🪴'
}

const LoteForm: React.FC<{
  initial?: Partial<Lote>
  onSave: (data: Partial<Lote>) => Promise<void>
  onClose: () => void
  loading: boolean
}> = ({ initial = {}, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    nombre: initial.nombre || '',
    hectareas: initial.hectareas || '',
    cultivo: initial.cultivo || 'Soja',
    ubicacion: initial.ubicacion || '',
    campania: initial.campania || '2024/25',
    notas: initial.notas || '',
  })
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, hectareas: Number(form.hectareas) })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {[
          { label: 'Nombre del lote', key: 'nombre', placeholder: 'Ej: Lote Norte', full: true },
          { label: 'Hectáreas', key: 'hectareas', placeholder: '0', type: 'number' },
          { label: 'Campaña', key: 'campania', placeholder: '2024/25' },
          { label: 'Ubicación (opcional)', key: 'ubicacion', placeholder: 'San Jorge, Santa Fe', full: true },
        ].map(({ label, key, placeholder, type, full }) => (
          <div key={key} style={full ? { gridColumn: '1 / -1' } : {}}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</label>
            <input
              type={type || 'text'} required={['nombre', 'hectareas'].includes(key)}
              value={(form as any)[key]} placeholder={placeholder}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Cultivo</label>
          <select value={form.cultivo} onChange={(e) => set('cultivo', e.target.value)}>
            {CULTIVOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={loading} icon="check">
          {initial.id ? 'Guardar cambios' : 'Crear lote'}
        </Button>
      </div>
    </form>
  )
}

export const LotesPage: React.FC = () => {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<'nuevo' | Lote | null>(null)

  const cargar = () => lotesApi.listar().then((r) => setLotes(r.data)).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const guardar = async (data: Partial<Lote>) => {
    setSaving(true)
    try {
      if (typeof modal === 'object' && modal !== null && 'id' in modal) {
        await lotesApi.actualizar(modal.id, data)
      } else {
        await lotesApi.crear(data)
      }
      await cargar()
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este lote y todos sus datos?')) return
    await lotesApi.eliminar(id)
    cargar()
  }

  return (
    <div className="animate-in">
      <div style={{
        padding: '18px 28px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Mis lotes</div>
        <Button icon="plus" onClick={() => setModal('nuevo')}>Nuevo lote</Button>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando...</div>
        ) : lotes.length === 0 ? (
          <EmptyState icon="map" message="Todavía no tenés lotes. Creá el primero." action={
            <Button icon="plus" onClick={() => setModal('nuevo')}>Crear primer lote</Button>
          } />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {lotes.map((lote) => (
              <Card key={lote.id} style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 22 }}>{CULTIVO_ICON[lote.cultivo] || '🪴'}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setModal(lote)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                    >
                      <i className="ti ti-pencil" style={{ fontSize: 15 }} />
                    </button>
                    <button
                      onClick={() => eliminar(lote.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                    >
                      <i className="ti ti-trash" style={{ fontSize: 15 }} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{lote.nombre}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {lote.hectareas} ha · {lote.cultivo} · {lote.campania}
                </div>
                {lote.ubicacion && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 11 }} /> {lote.ubicacion}
                  </div>
                )}
              </Card>
            ))}

            {/* Card agregar */}
            <div
              onClick={() => setModal('nuevo')}
              style={{
                border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexDirection: 'column', gap: 8, color: 'var(--text-muted)',
                minHeight: 120, transition: 'border-color .15s',
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: 22 }} />
              <span style={{ fontSize: 13 }}>Agregar lote</span>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={typeof modal === 'object' && modal !== null && 'id' in modal ? 'Editar lote' : 'Nuevo lote'}
      >
        <LoteForm
          initial={typeof modal === 'object' && modal !== null && 'id' in modal ? modal : {}}
          onSave={guardar}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
