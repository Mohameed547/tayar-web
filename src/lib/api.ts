import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sc_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// ── Response interceptor: global error handling ───────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    if (status === 401) {
      // Token expired → clear and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sc_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
