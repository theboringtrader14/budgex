export const CATEGORIES = [
  { id: 'Food', label: 'Food', icon: '🍔', color: '#F59E0B' },
  { id: 'Travel', label: 'Travel', icon: '✈️', color: '#3B82F6' },
  { id: 'Shopping', label: 'Shopping', icon: '🛍', color: '#EC4899' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'Health', label: 'Health', icon: '💊', color: '#22C55E' },
  { id: 'Utilities', label: 'Utilities', icon: '💡', color: '#06B6D4' },
  { id: 'Rent', label: 'Rent', icon: '🏠', color: '#F97316' },
  { id: 'Other', label: 'Other', icon: '💰', color: '#6B7280' },
]

export const getCategoryMeta = (id: string) =>
  CATEGORIES.find(c => c.id.toLowerCase() === id.toLowerCase()) ?? CATEGORIES[CATEGORIES.length - 1]

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const daysUntil = (dateStr: string): number => {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export const getDueBadgeStyle = (days: number): { color: string; bg: string; label: string } => {
  if (days < 0) return { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'Overdue' }
  if (days <= 7) return { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: `${days}d` }
  if (days <= 30) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: `${days}d` }
  return { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: `${days}d` }
}

export const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const formatMonth = (ym: string): string => {
  const [y, m] = ym.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}
