import api from './axios';

export const prescriptionsAPI = {
  getAll:  (params) => api.get('/prescriptions', { params }),
  getOne:  (id)     => api.get(`/prescriptions/${id}`),
  create:  (data)   => api.post('/prescriptions', data),
  update:  (id, data)=> api.put(`/prescriptions/${id}`, data),
  getPDF:  (id)     => api.get(`/prescriptions/${id}/pdf`),
};