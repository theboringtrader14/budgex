import { useEffect, useState, type CSSProperties } from 'react'
import { subscriptionsAPI } from '@/services/api'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    amount: '',
    cycle: 'monthly',
    next_due_date: '',
  })

  const load = () => {
    subscriptionsAPI.list().then((r) => setSubs(r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.amount) return
    try {
      await subscriptionsAPI.create({
        name: form.name,
        amount: parseFloat(form.amount),
        cycle: form.cycle,
        next_due_date: form.next_due_date || null,
      })
      load()
      setModal(false)
      setForm({ name: '', amount: '', cycle: 'monthly', next_due_date: '' })
    } catch {}
  }

  const monthlyTotal = subs
    .filter((s) => s.cycle === 'monthly' || s.cycle === 'Monthly')
    .reduce((sum, s) => sum + (s.amount || 0), 0)

  const yearlyEquivalent = subs.reduce((sum, s) => {
    const cycle = (s.cycle || '').toLowerCase()
    if (cycle === 'monthly') return sum + (s.amount || 0) * 12
    if (cycle === 'yearly' || cycle === 'annual') return sum + (s.amount || 0)
    if (cycle === 'quarterly') return sum + (s.amount || 0) * 4
    return sum + (s.amount || 0) * 12
  }, 0)

  // Group subs
  const dueThisWeek = subs.filter((s) => {
    if (!s.next_due_date) return false
    const d = daysUntil(s.next_due_date)
    return d >= 0 && d <= 7
  })
  const dueThisMonth = subs.filter((s) => {
    if (!s.next_due_date) return false
    const d = daysUntil(s.next_due_date)
    return d > 7 && d <= 30
  })
  const allOthers = subs.filter((s) => {
    if (!s.next_due_date) return true
    const d = daysUntil(s.next_due_date)
    return d > 30 || d < 0
  })

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  }

  const SubRow = ({ sub }: { sub: any }) => {
    const days = sub.next_due_date ? daysUntil(sub.next_due_date) : null
    const isRed = days !== null && days <= 3 && days >= 0
    const isAmber = days !== null && days > 3 && days <= 7
    const chipColor = isRed ? '#FF4444' : isAmber ? '#FFD700' : 'rgba(232,232,248,0.3)'
    const chipBg = isRed ? 'rgba(255,68,68,0.12)' : isAmber ? 'rgba(255,215,0,0.12)' : 'rgba(124,58,237,0.1)'
    const dayLabel =
      days === null
        ? '—'
        : days === 0
        ? 'Today'
        : days < 0
        ? 'Overdue'
        : `${days}d`

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 10,
          background: isRed
            ? 'rgba(255,68,68,0.05)'
            : isAmber
            ? 'rgba(255,215,0,0.04)'
            : 'rgba(255,255,255,0.03)',
          border: `0.5px solid ${isRed ? 'rgba(255,68,68,0.2)' : isAmber ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: '#F0F0FF',
            }}
          >
            {sub.name}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(232,232,248,0.4)',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ textTransform: 'capitalize' }}>{sub.cycle}</span>
            {sub.next_due_date && (
              <span style={{ fontFamily: 'var(--font-mono)' }}>{sub.next_due_date}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: '2px 10px',
              borderRadius: 100,
              background: chipBg,
              color: chipColor,
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}
          >
            {dayLabel}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#A78BFA',
            }}
          >
            {inr(sub.amount)}
          </div>
        </div>
      </div>
    )
  }

  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div
      style={{
        fontSize: '10px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(232,232,248,0.4)',
        marginBottom: 10,
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {title}
      <span
        style={{
          background: 'rgba(124,58,237,0.15)',
          color: '#A78BFA',
          borderRadius: 100,
          padding: '1px 7px',
          fontSize: '9px',
        }}
      >
        {count}
      </span>
    </div>
  )

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
            Subscriptions
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            Recurring payments
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
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
          + Add
        </button>
      </div>

      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="cloud-fill" style={{ ...glassCard, borderLeft: '3px solid #7C3AED' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.45)', marginBottom: 8 }}>
            Monthly Recurring
          </div>
          <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F0F0FF' }}>
            {inr(monthlyTotal)}
          </div>
        </div>
        <div className="cloud-fill" style={{ ...glassCard, borderLeft: '3px solid #A78BFA' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.45)', marginBottom: 8 }}>
            Yearly Equivalent
          </div>
          <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#A78BFA' }}>
            {inr(yearlyEquivalent)}
          </div>
        </div>
      </div>

      {/* Grouped list */}
      <div className="cloud-fill" style={glassCard}>
        {!subs.length ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(232,232,248,0.3)',
              fontSize: '13px',
            }}
          >
            No subscriptions yet.
          </div>
        ) : (
          <>
            {dueThisWeek.length > 0 && (
              <>
                <SectionHeader title="Due This Week" count={dueThisWeek.length} />
                {dueThisWeek.map((s) => <SubRow key={s.id} sub={s} />)}
              </>
            )}
            {dueThisMonth.length > 0 && (
              <>
                <SectionHeader title="Due This Month" count={dueThisMonth.length} />
                {dueThisMonth.map((s) => <SubRow key={s.id} sub={s} />)}
              </>
            )}
            {allOthers.length > 0 && (
              <>
                <SectionHeader title="All Others" count={allOthers.length} />
                {allOthers.map((s) => <SubRow key={s.id} sub={s} />)}
              </>
            )}
          </>
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
              width: 340,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '16px',
                color: '#F0F0FF',
                marginBottom: 16,
              }}
            >
              Add Subscription
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="staax-input"
                placeholder="Name (Netflix, Gym…)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ width: '100%' }}
              />
              <input
                className="staax-input"
                placeholder="Amount (₹)"
                value={form.amount}
                type="number"
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                style={{ width: '100%' }}
              />
              <select
                className="staax-input"
                value={form.cycle}
                onChange={(e) => setForm((f) => ({ ...f, cycle: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                className="staax-input"
                type="date"
                value={form.next_due_date}
                onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
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
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
