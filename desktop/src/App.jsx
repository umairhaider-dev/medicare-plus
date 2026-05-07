import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import LoginScreen        from './screens/Auth/LoginScreen'
import DashboardScreen    from './screens/Dashboard/DashboardScreen'
import EmergencyScreen    from './screens/Emergency/EmergencyScreen'
import ICUScreen          from './screens/ICU/ICUScreen'
import SurgeryScreen      from './screens/Surgery/SurgeryScreen'
import OutpatientScreen   from './screens/Outpatient/OutpatientScreen'
import WardScreen         from './screens/Ward/WardScreen'
import PatientListScreen  from './screens/Patients/PatientListScreen'
import EMRScreen          from './screens/EMR/EMRScreen'
import AppointmentScreen  from './screens/Appointments/AppointmentScreen'
import LabScreen          from './screens/Lab/LabScreen'
import RadiologyScreen    from './screens/Radiology/RadiologyScreen'
import BloodBankScreen    from './screens/BloodBank/BloodBankScreen'
import PharmacyScreen     from './screens/Pharmacy/PharmacyScreen'
import ProcurementScreen  from './screens/Pharmacy/ProcurementScreen'
import BillingScreen      from './screens/Billing/BillingScreen'
import StaffScreen        from './screens/Staff/StaffScreen'
import QualityScreen      from './screens/Quality/QualityScreen'
import AnalyticsScreen    from './screens/Analytics/AnalyticsScreen'
import SettingsScreen     from './screens/Settings/SettingsScreen'

function ProtectedRoute({ children }) {
  const isAuth = !!localStorage.getItem('dpmc-token')
  return isAuth ? children : <Navigate to="/login" replace />
}

/* Listens for the auth:logout event fired by the axios interceptor on 401 */
function AuthLogoutListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('dpmc-token')
      localStorage.removeItem('dpmc-user')
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [navigate])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthLogoutListener />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"             element={<DashboardScreen />}   />
            <Route path="emergency"             element={<EmergencyScreen />}   />
            <Route path="icu"                   element={<ICUScreen />}         />
            <Route path="surgery"               element={<SurgeryScreen />}     />
            <Route path="outpatient"            element={<OutpatientScreen />}  />
            <Route path="ward"                  element={<WardScreen />}        />
            <Route path="patients"              element={<PatientListScreen />} />
            <Route path="emr"                   element={<EMRScreen />}         />
            <Route path="appointments"          element={<AppointmentScreen />} />
            <Route path="lab"                   element={<LabScreen />}         />
            <Route path="radiology"             element={<RadiologyScreen />}   />
            <Route path="bloodbank"             element={<BloodBankScreen />}   />
            <Route path="pharmacy"              element={<PharmacyScreen />}    />
            <Route path="pharmacy/inventory"    element={<PharmacyScreen />}    />
            <Route path="pharmacy/procurement"  element={<ProcurementScreen />} />
            <Route path="billing"               element={<BillingScreen />}     />
            <Route path="staff"                 element={<StaffScreen />}       />
            <Route path="quality"               element={<QualityScreen />}     />
            <Route path="analytics"             element={<AnalyticsScreen />}   />
            <Route path="settings"              element={<SettingsScreen />}    />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
