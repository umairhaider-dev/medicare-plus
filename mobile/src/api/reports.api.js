import api from './axios';

export const reportsAPI = {
  getDashboard:    ()       => api.get('/reports/dashboard'),
  getRevenue:      (params) => api.get('/reports/revenue', { params }),
  getDoctors:      (params) => api.get('/reports/doctors', { params }),
  getDoctorById:   (id, params) => api.get(`/reports/doctors/${id}`, { params }),
  getPharmacy:     (params) => api.get('/reports/pharmacy', { params }),
  getPatients:     (params) => api.get('/reports/patients', { params }),
  getLab:          (params) => api.get('/reports/lab', { params }),
  getAppointments: (params) => api.get('/reports/appointments', { params }),
  getTopMedicines: (params) => api.get('/reports/top-medicines', { params }),
  getTopDiagnoses: (params) => api.get('/reports/top-diagnoses', { params }),
  getDaily:        (date)   => api.get('/reports/daily', { params: { date } }),
};