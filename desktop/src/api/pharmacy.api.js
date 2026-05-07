import api from './axios'

export const pharmacyApi = {
  getMedicines: (params) => api.get('/api/pharmacy/medicines', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/pharmacy/medicines/${id}`).then(r => r.data),
  create: (data) => api.post('/api/pharmacy/medicines', data).then(r => r.data),
  update: (id, data) => api.put(`/api/pharmacy/medicines/${id}`, data).then(r => r.data),
  getLowStock: () => api.get('/api/pharmacy/low-stock').then(r => r.data),
  dispense: (data) => api.post('/api/pharmacy/dispense', data).then(r => r.data),
  getSales: (params) => api.get('/api/sales', { params }).then(r => r.data),
  getInventory: () => api.get('/api/inventory', { params: { category: 'pharmacy' } }).then(r => r.data),
}
