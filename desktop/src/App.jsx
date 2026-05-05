import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/auth.store'
import Layout from './components/layout/Layout'
import LoginScreen        from './screens/Auth/LoginScreen'
import DashboardScreen    from './screens/Dashboard/DashboardScreen'
import EmergencyScreen    from './screens/Emergency/EmergencyScreen'
import ICUScreen          from './screens/ICU/ICUScreen'
import SurgeryScreen      from './screens/Surgery/SurgeryScreen'
import PatientListScreen  from './screens/Patients/PatientListScreen'
import AppointmentScreen  from './screens/Appointments/AppointmentScreen'
import LabScreen          from './screens/Lab/LabScreen'
import PharmacyScreen     from './screens/Pharmacy/PharmacyScreen'
import BillingScreen      from './screens/Billing/BillingScreen'
import AnalyticsScreen    from './screens/Analytics/AnalyticsScreen'
import WardScreen         from './screens/Ward/WardScreen'
import StaffScreen        from './screens/Staff/StaffScreen'
import SettingsScreen     from './screens/Settings/SettingsScreen'

/* Placeholder for modules not yet fully implemented */
function Placeholder({ title, color = '#0ea5e9' }) {
  return (
    <div className="page-content flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <span className="text-3xl">🏥</span>
        </div>
        <h2 className="text-xl font-700 mb-2 gradient-text-blue">{title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Module in active development — Enterprise deployment ready
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  // Check localStorage directly — avoids React 18 batching race with Zustand
  const isAuth = !!localStorage.getItem('dpmc-token')
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<DashboardScreen />} />
            <Route path="emergency"   element={<EmergencyScreen />} />
            <Route path="icu"         element={<ICUScreen />} />
            <Route path="surgery"     element={<SurgeryScreen />} />
            <Route path="outpatient"  element={<Placeholder title="Outpatient Clinic" />} />
            <Route path="ward"        element={<WardScreen />} />
            <Route path="patients"    element={<PatientListScreen />} />
            <Route path="emr"         element={<Placeholder title="Electronic Medical Records" />} />
            <Route path="appointments"element={<AppointmentScreen />} />
            <Route path="lab"         element={<LabScreen />} />
            <Route path="radiology"   element={<Placeholder title="Radiology & Imaging" color="#8b5cf6" />} />
            <Route path="bloodbank"   element={<Placeholder title="Blood Bank Management" color="#ef4444" />} />
            <Route path="pharmacy"    element={<PharmacyScreen />} />
            <Route path="pharmacy/inventory"   element={<PharmacyScreen />} />
            <Route path="pharmacy/procurement" element={<Placeholder title="Procurement & Purchase Orders" color="#10b981" />} />
            <Route path="billing"     element={<BillingScreen />} />
            <Route path="staff"       element={<StaffScreen />} />
            <Route path="quality"     element={<Placeholder title="Quality Control & JCI" color="#f59e0b" />} />
            <Route path="analytics"   element={<AnalyticsScreen />} />
            <Route path="settings"    element={<SettingsScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
