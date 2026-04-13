import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard'
import { HomePage } from '@/features/home'
import { LoginPage } from '@/features/login'
import { SignupPage } from '@/features/signup'
import { SettingsPage } from '@/features/settings'
import { AppLayout } from '@/shared/layout/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
