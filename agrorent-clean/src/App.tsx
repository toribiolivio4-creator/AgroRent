import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { useThemeStore } from './store/theme'

import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegistroPage } from './pages/RegistroPage'
import { DashboardPage } from './pages/DashboardPage'
import { LotesPage } from './pages/LotesPage'
import { GastosPage } from './pages/GastosPage'
import { IngresosPage } from './pages/IngresosPage'
import { RankingPage } from './pages/RankingPage'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App: React.FC = () => {
  const { token, cargarPerfil } = useAuthStore()
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (token) cargarPerfil()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* App protegida */}
        <Route element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lotes" element={<LotesPage />} />
          <Route path="/gastos" element={<GastosPage />} />
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Route>

        {/* Redirect raíz */}
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
