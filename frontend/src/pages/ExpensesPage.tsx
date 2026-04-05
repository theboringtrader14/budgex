import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI } from '@/services/api'
import { StaaxSelect } from '@/components/StaaxSelect'

const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Others']
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B00', Travel: '#4488FF', Bills: '#FFD700',
  Shopping: '#FF4444', Health: '#22DD88', Others: 'rgba(232,232,248,0.35)',
}

const CAT_OPTIONS = CATEGORIES.slice(1).map(c => ({ value: c, label: c }))

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  const load = () => {
    const params: any = {}
    if (filter !== 'All') params.category = filter
    expensesAPI.list(params).then(r => setExpenses(r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [filter])

  const save = async () => {
    if (!form.amount) return
    setSaving(true)
    try {
      await expensesAPI.create({ amount: parseFloat(form.amount), category: form.category, description: form.description, date: form.date })
      setModal(false)
      setForm({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] })
      load()
    } finally { setSaving(false) }
  }

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)', borderRadius: 'var(--radius-lg)', padding: '20px',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)' }}>Expenses</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>All your transactions</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)',
        }}>+ Add Expense</button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <div key={c} onClick={() => setFilter(c)} style={{
            padding: '4px 12px', borderRadius: 100, fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600,
            background: filter === c ? 'rgba(124,58,237,0.15)' : 'transparent',
            color: filter === c ? '#A78BFA' : 'rgba(232,232,248,0.5)',
            border: filter === c ? '0.5px solid rgba(124,58,237,0.4)' : '0.5px solid rgba(232,232,248,0.12)',
            transition: 'all 0.15s',
          }}>{c}</div>
        ))}
      </div>

      {/* Table */}
      <div className="cloud-fill" style={{ ...glassCard }}>
        {!expenses.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(232,232,248,0.3)', fontSize: '13px' }}>No expenses found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                {['Date', 'Category', 'Description', 'Amount'].map((h, i) => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.4)', textAlign: i === 0 || i === 2 ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr key={exp.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(232,232,248,0.6)', textAlign: 'left' }}>{exp.date}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ background: `${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Others}22`, color: CATEGORY_COLORS[exp.category] || 'rgba(232,232,248,0.5)', borderRadius: 4, padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{exp.category}</span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '12px', color: '#F0F0FF', textAlign: 'left' }}>{exp.description}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A78BFA', textAlign: 'right' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal(false)}>
          <div style={{ background: 'rgba(18,18,24,0.98)', backdropFilter: 'blur(20px)', border: '0.5px solid var(--bx-border)', borderRadius: 16, padding: '28px', width: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#F0F0FF', marginBottom: 20 }}>Add Expense</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="staax-input" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ width: '100%' }} />
              <StaaxSelect value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={CAT_OPTIONS} width="100%" />
              <input className="staax-input" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
              <input className="staax-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '0.5px solid rgba(232,232,248,0.15)', borderRadius: 8, color: 'rgba(232,232,248,0.5)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-display)' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
