import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI } from '@/services/api'
import { StaaxSelect } from '@/components/StaaxSelect'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }))

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B00', Travel: '#4488FF', Bills: '#FFD700',
  Shopping: '#FF4444', Health: '#22DD88', Others: '#A78BFA',
}

export default function BudgexAnalyticsPage() {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    expensesAPI.summary().then(r => setSummary(r.data)).catch(() => {})
  }, [month])

  const byCategory: [string, number][] = summary?.by_category
    ? (Object.entries(summary.by_category) as [string, number][]).sort((a, b) => b[1] - a[1])
    : []
  const maxVal = byCategory.length ? Math.max(...byCategory.map(([, v]) => v as number)) : 1

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)', borderRadius: 'var(--radius-lg)', padding: '20px',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)' }}>Analytics</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Spending patterns</p>
        </div>
        <StaaxSelect value={month} onChange={setMonth} options={MONTH_OPTIONS} width="100px" />
      </div>

      {/* Category breakdown */}
      <div className="cloud-fill" style={{ ...glassCard }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: '#F0F0FF', marginBottom: 16 }}>By Category</div>
        {!byCategory.length ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(232,232,248,0.3)', fontSize: '13px' }}>No data for this month.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byCategory.map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-display)', color: '#F0F0FF' }}>{cat}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: CATEGORY_COLORS[cat] || '#A78BFA' }}>₹{(val as number).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: CATEGORY_COLORS[cat] || '#7C3AED', width: `${Math.round(((val as number) / maxVal) * 100)}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
