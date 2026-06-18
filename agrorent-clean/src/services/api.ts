import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Interceptor: inyecta el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: redirige al login si el token expiró
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  registro: (data: { nombre: string; email: string; password: string }) =>
    api.post('/auth/registro', data),

  login: (email: string, password: string) => {
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
export const lotesApi = {
  listar: () => api.get('/lotes/'),
  crear: (data: object) => api.post('/lotes/', data),
  actualizar: (id: number, data: object) => api.patch(`/lotes/${id}`, data),
  eliminar: (id: number) => api.delete(`/lotes/${id}`),
}

// ── Gastos ────────────────────────────────────────────
export const gastosApi = {
  listar: (lote_id?: number) =>
    api.get('/gastos/', { params: lote_id ? { lote_id } : {} }),
  crear: (data: object) => api.post('/gastos/', data),
  actualizar: (id: number, data: object) => api.patch(`/gastos/${id}`, data),
  eliminar: (id: number) => api.delete(`/gastos/${id}`),
}

// ── Ingresos ──────────────────────────────────────────
export const ingresosApi = {
  listar: (lote_id?: number) =>
    api.get('/ingresos/', { params: lote_id ? { lote_id } : {} }),
  crear: (data: object) => api.post('/ingresos/', data),
  actualizar: (id: number, data: object) => api.patch(`/ingresos/${id}`, data),
  eliminar: (id: number) => api.delete(`/ingresos/${id}`),
}

// ── Rentabilidad ──────────────────────────────────────
export const rentabilidadApi = {
  dashboard: () => api.get('/rentabilidad/dashboard'),
  lote: (id: number) => api.get(`/rentabilidad/lote/${id}`),
}

export default api
