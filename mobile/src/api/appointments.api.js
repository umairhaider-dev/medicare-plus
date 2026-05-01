import api from './axios';

export const appointmentsAPI = {
  getAll:       (params)      => api.get('/appointments', { params }),
  getToday:     ()            => api.get('/appointments/today'),
  getStats:     ()            => api.get('/appointments/stats'),
  getOne:       (id)          => api.get(`/appointments/${id}`),
  create:       (data)        => api.post('/appointments', data),
  update:       (id, data)    => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status)  => api.put(`/appointments/${id}/status`, { status }),
  cancel:       (id)          => api.delete(`/appointments/${id}`),
};