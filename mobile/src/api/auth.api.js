import api from './axios';

export const authAPI = {
  login:    (data)     => api.post('/auth/login', data),
  register: (data)     => api.post('/auth/register', data),
  getMe:    ()         => api.get('/auth/me'),
  addStaff: (data)     => api.post('/auth/add-staff', data),
  getDoctors:()        => api.get('/auth/doctors'),
};