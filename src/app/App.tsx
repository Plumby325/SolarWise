import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/presentation/components/DashboardPage'
import { HomePage } from '@/features/home/presentation/components/HomePage'
import { SettingsPage } from '@/features/settings/presentation/components/SettingsPage'
import { AppLayout } from '@/shared/components/layout/AppLayout'

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
