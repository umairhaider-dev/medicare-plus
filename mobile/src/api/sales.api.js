import api from './axios';

export const salesAPI = {
  getAll:   (params) => api.get('/sales', { params }),
  getToday: ()       => api.get('/sales/today'),
  getStats: ()       => api.get('/sales/stats'),
  getOne:   (id)     => api.get(`/sales/${id}`),
  create:   (data)   => api.post('/sales', data),
  getInvoice:(id)    => api.get(`/sales/${id}/invoice`),
};