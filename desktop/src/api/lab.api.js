import api from './axios'

export const labApi = {
  getOrders: (params) => api.get('/api/lab', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/lab/${id}`).then(r => r.data),
  create: (data) => api.post('/api/lab', data).then(r => r.data),
  updateResult: (id, data) => api.put(`/api/lab/${id}/result`, data).then(r => r.data),
  getPending: () => api.get('/api/lab/pending').then(r => r.data),
  getCritical: () => api.get('/api/lab/critical').then(r => r.data),
}
