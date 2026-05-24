import { Navigate, Route, Routes } from 'react-router-dom'
import { AboutPage } from '@/features/about'
import { AnomalyDetailPage, AnomalyDetectionMainPage } from '@/features/dashboard-detection'
import { DashboardPage } from '@/features/dashboard'
import { FindingPasswordPage } from '@/features/finding-password'
import { HomePage } from '@/features/home'
import { DashboardGuideArticlePage, ResourcesPage, ServiceStartArticlePage } from '@/features/resources'
import { LoginPage } from '@/features/login'
import { PowerForecastPage } from '@/features/power-forecast'
import { ServiceIntroductionPage } from '@/features/service-introduction'
import { SignupPage } from '@/features/signup'
import { NotificationMailHistoryPage, NotificationSettingsPage, PlantSettingsPage, ProfileSettingsPage, SettingsPage } from '@/features/settings'
import { AppLayout } from '@/shared/layout/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServiceIntroductionPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/resources/service-start" element={<ServiceStartArticlePage />} />
      <Route path="/resources/dashboard-guide" element={<DashboardGuideArticlePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/power-forecast" element={<PowerForecastPage />} />
      <Route path="/anomaly-detection" element={<AnomalyDetectionMainPage />} />
      <Route path="/anomaly-detection/detail" element={<AnomalyDetailPage />} />
      <Route path="/settings/profile" element={<ProfileSettingsPage />} />
      <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
      <Route path="/settings/notifications/history" element={<NotificationMailHistoryPage />} />
      <Route path="/settings/plant" element={<PlantSettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/finding-password" element={<FindingPasswordPage step={1} />} />
      <Route path="/finding-password/mail-sent" element={<FindingPasswordPage step={2} />} />
      <Route path="/finding-password/reset" element={<FindingPasswordPage step={3} />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
