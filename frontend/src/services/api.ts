import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002'

const api = axios.create({ baseURL: BASE_URL })

export const expensesAPI = {
  create: (data: object) => api.post('/api/v1/expenses', data),
  list: (params?: object) => api.get('/api/v1/expenses', { params }),
  summary: () => api.get('/api/v1/expenses/summary'),
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
