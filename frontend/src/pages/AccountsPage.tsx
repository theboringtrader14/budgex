import { useEffect, useState, type CSSProperties } from 'react'
import { accountsAPI } from '@/services/api'

const NEURO: CSSProperties = {
  background: '#1A1A2E',
  boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.03)',
  borderRadius: 20, padding: '20px',
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', balance: '' })

  useEffect(() => {
    accountsAPI.list().then(r => {
      const data = r.data || []
      if (!data.length) {
        setAccounts([
          { id: 'cash', name: 'Cash', balance: 0 },
          { id: 'bank', name: 'Bank', balance: 0 },
          { id: 'credit', name: 'Credit Card', balance: 0 },
        ])
      } else {
        setAccounts(data)
      }
    }).catch(() => {
      setAccounts([
        { id: 'cash', name: 'Cash', balance: 0 },
        { id: 'bank', name: 'Bank', balance: 0 },
        { id: 'credit', name: 'Credit Card', balance: 0 },
      ])
    })
  }, [])

  const save = async () => {
    if (!form.name) return
    try {
      await accountsAPI.create({ name: form.name, balance: parseFloat(form.balance) || 0 })
      accountsAPI.list().then(r => setAccounts(r.data || []))
      setModal(false); setForm({ name: '', balance: '' })
    } catch {}
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)' }}>Accounts</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Manage your wallets</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>+ Add Account</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{ ...NEURO }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.4)', marginBottom: 10 }}>{acc.name}</div>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F0F0FF', lineHeight: 1 }}>₹{(acc.balance || 0).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal(false)}>
          <div style={{ background: 'rgba(18,18,24,0.98)', backdropFilter: 'blur(20px)', border: '0.5px solid var(--bx-border)', borderRadius: 16, padding: '28px', width: 320 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#F0F0FF', marginBottom: 16 }}>Add Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="staax-input" placeholder="Account name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
              <input className="staax-input" placeholder="Initial balance (₹)" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} style={{ width: '100%' }} />
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
