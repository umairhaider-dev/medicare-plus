import axios from 'axios'
import { API_URL } from '../constants'

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dpmc-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 from a real server response (not network errors)
    if (error.response?.status === 401) {
      localStorage.removeItem('dpmc-token')
      localStorage.removeItem('dpmc-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
