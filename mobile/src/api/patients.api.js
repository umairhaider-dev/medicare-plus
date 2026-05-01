import api from './axios';

export const patientsAPI = {
  getAll:     (params) => api.get('/patients', { params }),
  getOne:     (id)     => api.get(`/patients/${id}`),
  create:     (data)   => api.post('/patients', data),
  update:     (id, data)=> api.put(`/patients/${id}`, data),
  remove:     (id)     => api.delete(`/patients/${id}`),
  getHistory: (id)     => api.get(`/patients/${id}/history`),
};