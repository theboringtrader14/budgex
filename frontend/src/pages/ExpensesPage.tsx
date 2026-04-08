import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI } from '@/services/api'
import { StaaxSelect } from '@/components/StaaxSelect'

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Others']
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B35',
  Travel: '#4488FF',
  Bills: '#FFD700',
  Shopping: '#FF4488',
  Health: '#22DD88',
  Others: 'rgba(232,232,248,0.35)',
}
const CAT_OPTIONS = CATEGORIES.slice(1).map((c) => ({ value: c, label: c }))

type DateRange = 'this_month' | 'last_month' | 'all'

function dayLabel(dateStr: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const d = new Date(dateStr)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function ExpensesPage() {
  const [allExpenses, setAllExpenses] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [limit, setLimit] = useState(50)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  const load = () => {
    expensesAPI.list({ limit: 200 }).then((r) => setAllExpenses(r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  // Filter logic
  const now = new Date()
  const filtered = allExpenses.filter((exp) => {
    if (filter !== 'All' && exp.category !== filter) return false
    if (search && !(exp.description || '').toLowerCase().includes(search.toLowerCase())) return false
    if (dateRange === 'this_month') {
      const d = new Date(exp.date)
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
    } else if (dateRange === 'last_month') {
      const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      const d = new Date(exp.date)
      if (d.getMonth() !== lm || d.getFullYear() !== ly) return false
    }
    return true
  })

  const paginated = filtered.slice(0, limit)

  // Group by day
  const grouped: Record<string, any[]> = {}
  paginated.forEach((exp) => {
    const key = exp.date || 'Unknown'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(exp)
  })
  const groupedDays = Object.entries(grouped).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  )

  const openAdd = () => {
    setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] })
    setModal(true)
  }

  const save = async () => {
    if (!form.amount) return
    setSaving(true)
    try {
      await expensesAPI.create({
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      })
      setModal(false)
      setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] })
      load()
    } finally {
      setSaving(false)
    }
  }

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  }

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
  ]

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--bx-vivid)',
            }}
          >
            Expenses
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            {filtered.length} transactions
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
        >
          + Add Expense
        </button>
      </div>

      {/* Search + date range */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid var(--bx-border)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '12px',
            color: '#F0F0FF',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            width: 220,
          }}
        />
        <StaaxSelect
          value={dateRange}
          onChange={(v) => setDateRange(v as DateRange)}
          options={rangeOptions}
          width="140px"
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <div
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '4px 12px',
              borderRadius: 100,
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              background: filter === c ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: filter === c ? '#A78BFA' : 'rgba(232,232,248,0.5)',
              border:
                filter === c
                  ? '0.5px solid rgba(124,58,237,0.4)'
                  : '0.5px solid rgba(232,232,248,0.12)',
              transition: 'all 0.15s',
            }}
          >
            {c !== 'All' && (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[c] || 'rgba(232,232,248,0.4)',
                  marginRight: 5,
                  verticalAlign: 'middle',
                }}
              />
            )}
            {c}
          </div>
        ))}
      </div>

      {/* Grouped by day */}
      <div className="cloud-fill" style={glassCard}>
        {groupedDays.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(232,232,248,0.3)',
              fontSize: '13px',
            }}
          >
            No expenses found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groupedDays.map(([dateStr, exps]) => (
              <div key={dateStr}>
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(232,232,248,0.45)',
                    marginBottom: 8,
                    paddingBottom: 4,
                    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{dayLabel(dateStr)}</span>
                  <span style={{ color: '#A78BFA', fontFamily: 'var(--font-mono)' }}>
                    {inr(exps.reduce((s: number, e: any) => s + Number(e.amount), 0))}
                  </span>
                </div>
                {exps.map((exp: any) => {
                  const catColor = CATEGORY_COLORS[exp.category] || 'rgba(232,232,248,0.4)'
                  return (
                    <div
                      key={exp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 0',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span
                        style={{
                          background: `${catColor}22`,
                          color: catColor,
                          borderRadius: 6,
                          padding: '2px 9px',
                          fontSize: '10px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          minWidth: 68,
                          textAlign: 'center',
                        }}
                      >
                        {exp.category}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: '12px',
                          color: '#F0F0FF',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {exp.description || '—'}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: '#A78BFA',
                          flexShrink: 0,
                        }}
                      >
                        {inr(Number(exp.amount))}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Load more */}
            {filtered.length > limit && (
              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <button
                  onClick={() => setLimit((l) => l + 50)}
                  style={{
                    background: 'rgba(124,58,237,0.1)',
                    border: '0.5px solid rgba(124,58,237,0.3)',
                    borderRadius: 8,
                    padding: '6px 20px',
                    fontSize: '12px',
                    color: '#A78BFA',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                  }}
                >
                  Load more ({filtered.length - limit} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add modal */}
      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setModal(false)}
        >
          <div
            style={{
              background: 'rgba(18,18,24,0.98)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid var(--bx-border)',
              borderRadius: 16,
              padding: '28px',
              width: 360,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '16px',
                color: '#F0F0FF',
                marginBottom: 20,
              }}
            >
              Add Expense
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="staax-input"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                style={{ width: '100%' }}
              />
              <StaaxSelect
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                options={CAT_OPTIONS}
                width="100%"
              />
              <input
                className="staax-input"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{ width: '100%' }}
              />
              <input
                className="staax-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setModal(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'transparent',
                  border: '0.5px solid rgba(232,232,248,0.15)',
                  borderRadius: 8,
                  color: 'rgba(232,232,248,0.5)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
