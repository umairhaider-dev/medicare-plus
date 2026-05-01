import api from './axios';

export const pharmacyAPI = {
  getAll:       (params) => api.get('/pharmacy', { params }),
  search:       (q)      => api.get('/pharmacy/search', { params: { q } }),
  getLowStock:  ()       => api.get('/pharmacy/low-stock'),
  getExpiring:  ()       => api.get('/pharmacy/expiring-soon'),
  getOne:       (id)     => api.get(`/pharmacy/${id}`),
  create:       (data)   => api.post('/pharmacy', data),
  update:       (id, data)=> api.put(`/pharmacy/${id}`, data),
  remove:       (id)     => api.delete(`/pharmacy/${id}`),
};