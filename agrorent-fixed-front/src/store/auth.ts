import { create } from 'zustand'
import { Usuario } from '../types'
import { authApi } from '../services/api'

interface AuthState {
  usuario: Usuario | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  registro: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
  cargarPerfil: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    const { data } = await authApi.login(email, password)
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token, usuario: data.usuario, loading: false })
  },

  registro: async (nombre, email, password) => {
    set({ loading: true })
    await authApi.registro({ nombre, email, password })
    set({ loading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ usuario: null, token: null })
  },

  cargarPerfil: async () => {
    try {
      const { data } = await authApi.me()
      set({ usuario: data })
    } catch {
      localStorage.removeItem('token')
      set({ usuario: null, token: null })
    }
  },
}))
