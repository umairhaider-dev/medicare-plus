import api from './axios';

export const remindersAPI = {
  getAll:                (params) => api.get('/reminders', { params }),
  getStats:              ()       => api.get('/reminders/stats'),
  create:                (data)   => api.post('/reminders', data),
  sendNow:               (data)   => api.post('/reminders/send-now', data),
  sendAppointmentReminder:(data)  => api.post('/reminders/appointment-reminder', data),
  sendLabResult:         (data)   => api.post('/reminders/lab-result-ready', data),
  sendWelcome:           (data)   => api.post('/reminders/welcome', data),
  sendBulk:              (data)   => api.post('/reminders/bulk', data),
  cancel:                (id)     => api.delete(`/reminders/${id}`),
};