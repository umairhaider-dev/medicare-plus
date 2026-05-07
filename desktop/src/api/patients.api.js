import api from './axios'

export const patientsApi = {
  getAll: (params) => api.get('/api/patients', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/patients/${id}`).then(r => r.data),
  create: (data) => api.post('/api/patients', data).then(r => r.data),
  update: (id, data) => api.put(`/api/patients/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/patients/${id}`).then(r => r.data),
  getStats: () => api.get('/api/patients/stats').then(r => r.data),
}
