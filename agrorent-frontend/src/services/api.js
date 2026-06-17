import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  registro: (data) => api.post('/auth/registro', data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => api.get('/auth/me'),
}

// ── Lotes ─────────────────────────────────────────────
export const lotesAPI = {
  listar: () => api.get('/lotes/'),
  crear: (data) => api.post('/lotes/', data),
  obtener: (id) => api.get(`/lotes/${id}`),
  actualizar: (id, data) => api.patch(`/lotes/${id}`, data),
  eliminar: (id) => api.delete(`/lotes/${id}`),
}

// ── Gastos ────────────────────────────────────────────
export const gastosAPI = {
  listar: (loteId) => api.get('/gastos/', { params: loteId ? { lote_id: loteId } : {} }),
  crear: (data) => api.post('/gastos/', data),
  actualizar: (id, data) => api.patch(`/gastos/${id}`, data),
  eliminar: (id) => api.delete(`/gastos/${id}`),
}

// ── Ingresos ──────────────────────────────────────────
export const ingresosAPI = {
  listar: (loteId) => api.get('/ingresos/', { params: loteId ? { lote_id: loteId } : {} }),
  crear: (data) => api.post('/ingresos/', data),
  actualizar: (id, data) => api.patch(`/ingresos/${id}`, data),
  eliminar: (id) => api.delete(`/ingresos/${id}`),
}

// ── Rentabilidad ──────────────────────────────────────
export const rentabilidadAPI = {
  dashboard: () => api.get('/rentabilidad/dashboard'),
  lote: (id) => api.get(`/rentabilidad/lote/${id}`),
}

export default api
