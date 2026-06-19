import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from '../ui/ThemeToggle'

export const AppLayout: React.FC = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 14, right: 18, zIndex: 50 }}>
        <ThemeToggle />
      </div>
      <Outlet />
    </main>
  </div>
)
