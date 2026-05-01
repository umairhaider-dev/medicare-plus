import api from './axios';

export const labAPI = {
  getAll:           (params)       => api.get('/lab', { params }),
  getCatalogue:     ()             => api.get('/lab/tests'),
  getOne:           (id)           => api.get(`/lab/${id}`),
  create:           (data)         => api.post('/lab', data),
  addResults:       (id, data)     => api.put(`/lab/${id}/results`, data),
  updateTestResult: (id, testId, data) => api.put(`/lab/${id}/test/${testId}`, data),
  cancel:           (id)           => api.delete(`/lab/${id}`),
};