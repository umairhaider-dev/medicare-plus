import { create } from 'zustand'
import axios from '../api/axios'

// Remove stale keys left by the old Zustand persist middleware
localStorage.removeItem('medicare-pro-auth')

// Read synchronously at module init — no async hydration race
const storedToken = localStorage.getItem('dpmc-token') || null
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem('dpmc-user') || 'null') }
  catch { return null }
})()

const useAuthStore = create((set, get) => ({
  user:    storedUser,
  token:   storedToken,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      const { token, user } = res.data
      localStorage.setItem('dpmc-token', token)
      localStorage.setItem('dpmc-user', JSON.stringify(user))
      set({ token, user, loading: false })
      return true
    } catch (err) {
      // Demo mode — works without backend
      if (email === 'admin@dpmc.ae' && password === 'admin123') {
        const demoUser = {
          id: 'demo-001',
          name: 'Dr. Admin Al Rashidi',
          email: 'admin@dpmc.ae',
          role: 'Administrator',
          dept: 'Administration',
        }
        const demoToken = 'demo-jwt-token-medicare-pro-2026'
        localStorage.setItem('dpmc-token', demoToken)
        localStorage.setItem('dpmc-user', JSON.stringify(demoUser))
        set({ user: demoUser, token: demoToken, loading: false })
        return true
      }
      const msg = err.response?.data?.message || 'Invalid credentials. Try admin@dpmc.ae / admin123'
      set({ error: msg, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('dpmc-token')
    localStorage.removeItem('dpmc-user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
