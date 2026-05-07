import api from './axios'

export const reportsApi = {
  getDashboardStats: () => api.get('/api/reports/dashboard-stats').then(r => r.data),
  getFinancialReport: (params) => api.get('/api/reports/financial', { params }).then(r => r.data),
  getPatientReport: (params) => api.get('/api/reports/patients', { params }).then(r => r.data),
  getOccupancyReport: (params) => api.get('/api/reports/occupancy', { params }).then(r => r.data),
  getDepartmentReport: (params) => api.get('/api/reports/departments', { params }).then(r => r.data),
}
