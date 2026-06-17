import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 680 } : {}}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--clay)', padding:'4px' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
