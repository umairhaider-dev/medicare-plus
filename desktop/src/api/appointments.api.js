import api from './axios'

export const appointmentsApi = {
  getAll: (params) => api.get('/api/appointments', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/appointments/${id}`).then(r => r.data),
  create: (data) => api.post('/api/appointments', data).then(r => r.data),
  update: (id, data) => api.put(`/api/appointments/${id}`, data).then(r => r.data),
  cancel: (id) => api.patch(`/api/appointments/${id}/cancel`).then(r => r.data),
  getToday: () => api.get('/api/appointments/today').then(r => r.data),
}
