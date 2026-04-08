import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002'

const api = axios.create({ baseURL: BASE_URL })

export const expensesAPI = {
  create: (data: object) => api.post('/api/v1/expenses', data),
  list: (params?: object) => api.get('/api/v1/expenses', { params }),
  summary: () => api.get('/api/v1/expenses/summary'),
  trends: (months = 6) => api.get('/api/v1/expenses/trends', { params: { months } }),
  merchants: (params?: { limit?: number; month?: number; year?: number }) =>
    api.get('/api/v1/expenses/merchants', { params }),
}

export const accountsAPI = {
  list: () => api.get('/api/v1/accounts'),
  create: (data: object) => api.post('/api/v1/accounts', data),
}

export const subscriptionsAPI = {
  list: () => api.get('/api/v1/subscriptions'),
  create: (data: object) => api.post('/api/v1/subscriptions', data),
}

export const parseAPI = {
  parse: (text: string) => api.post('/api/v1/parse', { text }),
}

export const budgetsAPI = {
  list: (params?: { month?: number; year?: number }) =>
    api.get('/api/v1/budgets', { params }),
  upsert: (data: { category: string; monthly_limit: number; month?: number; year?: number }) =>
    api.post('/api/v1/budgets', data),
  status: (params?: { month?: number; year?: number }) =>
    api.get('/api/v1/budgets/status', { params }),
}

export const analyticsAPI = {
  insights: () => api.get('/api/v1/analytics/insights'),
}
