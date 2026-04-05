import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI } from '@/services/api'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B00', Travel: '#4488FF', Bills: '#FFD700',
  Shopping: '#FF4444', Health: '#22DD88', Others: 'rgba(232,232,248,0.35)',
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    expensesAPI.summary().then(r => setSummary(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'TODAY', value: `₹${(summary?.today || 0).toLocaleString('en-IN')}` },
    { label: 'MONTHLY', value: `₹${(summary?.monthly || 0).toLocaleString('en-IN')}` },
    { label: 'TOP CATEGORY', value: summary?.by_category ? Object.entries(summary.by_category).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '—' : '—' },
    { label: 'SUBSCRIPTIONS', value: '₹0/mo' },
  ]

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)', borderRadius: 'var(--radius-lg)', padding: '20px',
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)' }}>Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Your financial overview</p>
        </div>
      </div>

      {/* 4 metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {cards.map(c => (
          <div key={c.label} className="cloud-fill" style={{ ...glassCard }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.5)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F0F0FF', lineHeight: 1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Recent expenses */}
      <div className="cloud-fill" style={{ ...glassCard }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: '#F0F0FF', marginBottom: 14 }}>Recent Expenses</div>
        {!summary?.recent5?.length ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(232,232,248,0.3)', fontSize: '13px' }}>No expenses yet. Add your first one!</div>
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
              {summary.recent5.map((exp: any) => (
                <tr key={exp.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(232,232,248,0.6)', textAlign: 'left' }}>{exp.date}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ background: `${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Others}22`, color: CATEGORY_COLORS[exp.category] || 'rgba(232,232,248,0.5)', borderRadius: 4, padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{exp.category}</span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '12px', color: '#F0F0FF', textAlign: 'left' }}>{exp.description}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A78BFA', textAlign: 'center' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
