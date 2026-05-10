import { Navigate, Route, Routes } from 'react-router-dom'
import { AboutPage } from '@/features/about'
import { AnomalyDetailPage, AnomalyDetectionMainPage } from '@/features/dashboard-detection'
import { DashboardPage } from '@/features/dashboard'
import { HomePage } from '@/features/home'
import { LoginPage } from '@/features/login'
import { PowerForecastPage } from '@/features/power-forecast'
import { ServiceIntroductionPage } from '@/features/service-introduction'
import { SignupPage } from '@/features/signup'
import { NotificationSettingsPage, PlantSettingsPage, ProfileSettingsPage, SettingsPage } from '@/features/settings'
import { AppLayout } from '@/shared/layout/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServiceIntroductionPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/power-forecast" element={<PowerForecastPage />} />
      <Route path="/anomaly-detection" element={<AnomalyDetectionMainPage />} />
      <Route path="/anomaly-detection/detail" element={<AnomalyDetailPage />} />
      <Route path="/settings/profile" element={<ProfileSettingsPage />} />
      <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
      <Route path="/settings/plant" element={<PlantSettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
