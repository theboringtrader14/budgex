import { useEffect, useState, type CSSProperties } from 'react'
import { subscriptionsAPI } from '@/services/api'

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', cycle: 'monthly', next_due_date: '' })

  useEffect(() => {
    subscriptionsAPI.list().then(r => setSubs(r.data || [])).catch(() => {})
  }, [])

  const save = async () => {
    if (!form.name || !form.amount) return
    try {
      await subscriptionsAPI.create({ name: form.name, amount: parseFloat(form.amount), cycle: form.cycle, next_due_date: form.next_due_date || null })
      subscriptionsAPI.list().then(r => setSubs(r.data || []))
      setModal(false); setForm({ name: '', amount: '', cycle: 'monthly', next_due_date: '' })
    } catch {}
  }

  const total = subs.reduce((s, sub) => s + (sub.amount || 0), 0)
  const today = new Date()
  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)', borderRadius: 'var(--radius-lg)', padding: '20px',
  }

  const isDueSoon = (dateStr: string) => {
    if (!dateStr) return false
    const diff = (new Date(dateStr).getTime() - today.getTime()) / 86400000
    return diff >= 0 && diff <= 3
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)' }}>Subscriptions</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Recurring payments</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>+ Add</button>
      </div>

      {/* Total card */}
      <div className="cloud-fill" style={{ ...glassCard, marginBottom: 16, display: 'inline-block', minWidth: 200 }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.5)', marginBottom: 6 }}>Monthly Total</div>
        <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F0F0FF' }}>₹{total.toLocaleString('en-IN')}</div>
      </div>

      {/* List */}
      <div className="cloud-fill" style={{ ...glassCard }}>
        {!subs.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(232,232,248,0.3)', fontSize: '13px' }}>No subscriptions yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Amount', 'Cycle', 'Due Date'].map((h, i) => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.4)', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#F0F0FF', textAlign: 'left', fontFamily: 'var(--font-display)' }}>{sub.name}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A78BFA', textAlign: 'center' }}>₹{sub.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px', fontSize: '11px', color: 'rgba(232,232,248,0.5)', textAlign: 'center', textTransform: 'capitalize' }}>{sub.cycle}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {sub.next_due_date ? (
                      <span style={{ background: isDueSoon(sub.next_due_date) ? 'rgba(255,68,68,0.15)' : 'rgba(124,58,237,0.12)', color: isDueSoon(sub.next_due_date) ? '#FF4444' : '#A78BFA', borderRadius: 4, padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{sub.next_due_date}</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal(false)}>
          <div style={{ background: 'rgba(18,18,24,0.98)', backdropFilter: 'blur(20px)', border: '0.5px solid var(--bx-border)', borderRadius: 16, padding: '28px', width: 340 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#F0F0FF', marginBottom: 16 }}>Add Subscription</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="staax-input" placeholder="Name (Netflix, Gym…)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
              <input className="staax-input" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ width: '100%' }} />
              <input className="staax-input" placeholder="Cycle (monthly/yearly)" value={form.cycle} onChange={e => setForm(f => ({ ...f, cycle: e.target.value }))} style={{ width: '100%' }} />
              <input className="staax-input" type="date" value={form.next_due_date} onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '0.5px solid rgba(232,232,248,0.15)', borderRadius: 8, color: 'rgba(232,232,248,0.5)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-display)' }}>Cancel</button>
              <button onClick={save} style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
