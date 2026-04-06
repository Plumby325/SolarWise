import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard'
import { HomePage } from '@/features/home'
import { SettingsPage } from '@/features/settings'
import { AppLayout } from '@/shared/layout/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
