import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI, subscriptionsAPI, accountsAPI } from '@/services/api'

/* ── Design constants ───────────────────────────── */
const VIVID = '#7C3AED'
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B00', Travel: '#4488FF', Bills: '#FF4444',
  Shopping: '#22BB55', Health: '#22CCCC', Others: '#8A8A94',
}

const glass: CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid var(--bx-border)',
  borderRadius: 'var(--radius-lg)',
}

/* ── Helpers ────────────────────────────────────── */
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

/* ── Monthly Trend SVG bar chart ────────────────── */
type MonthBar = { label: string; amount: number }

function MonthlyTrendChart({ expenses }: { expenses: any[] }) {
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [hovered, setHovered] = useState<number | null>(null)

  // Build last 6 months
  const now = new Date()
  const bars: MonthBar[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = expenses
      .filter(e => {
        const eDate = e.date ? e.date.substring(0, 7) : ''
        return eDate === ym
      })
      .reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)
    bars.push({ label: MONTHS_SHORT[d.getMonth()], amount: total })
  }

  const maxVal = Math.max(...bars.map(b => b.amount), 1)
  const chartW = 460
  const chartH = 120
  const barW = 40
  const gap = (chartW - barW * 6) / 7
  const labelY = chartH + 18

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={chartW + gap * 2} height={chartH + 36} style={{ display: 'block', margin: '0 auto' }}>
        {bars.map((b, i) => {
          const x = gap + i * (barW + gap)
          const barH = Math.max(4, Math.round((b.amount / maxVal) * chartH))
          const y = chartH - barH
          const isHov = hovered === i
          return (
            <g key={b.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={5}
                fill={isHov ? '#9D5FF0' : VIVID}
                opacity={isHov ? 1 : 0.82}
                style={{ transition: 'fill 0.15s, opacity 0.15s' }}
              />
              <text
                x={x + barW / 2} y={labelY}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(232,232,248,0.5)"
                fontFamily="var(--font-display)"
              >{b.label}</text>
              {isHov && b.amount > 0 && (
                <g>
                  <rect
                    x={x + barW / 2 - 34} y={y - 30}
                    width={68} height={22}
                    rx={5}
                    fill="rgba(18,18,28,0.95)"
                    stroke="rgba(124,58,237,0.4)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={x + barW / 2} y={y - 14}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill="#A78BFA"
                    fontFamily="var(--font-mono)"
                  >{inr(b.amount)}</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────── */
export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    expensesAPI.summary().then(r => setSummary(r.data)).catch(() => {})
    expensesAPI.list({ limit: 10 }).then(r => setExpenses(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    subscriptionsAPI.list().then(r => setSubs(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    accountsAPI.list().then(r => setAccounts(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  /* ── Derived values ── */
  const today = summary?.today ?? summary?.today_total ?? 0
  const monthly = summary?.monthly ?? 0
  const byCategory: [string, number][] = summary?.by_category
    ? (Object.entries(summary.by_category) as [string, number][]).sort((a, b) => b[1] - a[1])
    : []
  const topCat = byCategory[0]?.[0] ?? '—'
  const catMax = byCategory[0]?.[1] ?? 1

  const now = new Date()
  const subsUpcoming7 = subs.filter(s => {
    if (!s.next_due_date) return false
    const d = daysUntil(s.next_due_date)
    return d >= 0 && d <= 7
  })
  const subsNext3 = [...subs]
    .filter(s => s.next_due_date)
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 3)

  // Label on what month/year
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  /* ── Top summary cards ── */
  const summaryCards = [
    {
      label: 'TODAY SPENT',
      value: inr(today),
      sub: new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      color: '#A78BFA',
    },
    {
      label: 'THIS MONTH',
      value: inr(monthly),
      sub: monthLabel,
      color: '#7C3AED',
    },
    {
      label: 'TOP CATEGORY',
      value: topCat,
      sub: byCategory[0] ? inr(byCategory[0][1]) : '—',
      color: CATEGORY_COLORS[topCat] || '#8A8A94',
    },
    {
      label: 'SUBSCRIPTIONS DUE',
      value: String(subsUpcoming7.length),
      sub: 'in next 7 days',
      color: subsUpcoming7.length > 0 ? '#FF4444' : '#22DD88',
    },
  ]

  /* ── Section label style ── */
  const sectionLabel: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '13px',
    color: '#F0F0FF',
    marginBottom: 16,
  }

  const colHeader: CSSProperties = {
    padding: '8px 10px',
    fontSize: '10px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(232,232,248,0.4)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: VIVID }}>Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>Financial overview — {monthLabel}</p>
        </div>
      </div>

      {/* ── Section 1: Top Summary Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {summaryCards.map(c => (
          <div key={c.label} className="cloud-fill" style={{
            ...glass,
            padding: '18px 20px',
            borderLeft: `3px solid ${c.color}`,
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.45)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F0F0FF', lineHeight: 1, marginBottom: 6 }}>{c.value}</div>
            <div style={{ fontSize: '10px', color: 'rgba(232,232,248,0.35)', fontFamily: 'var(--font-body)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Section 2 + 3: Trend + Category (2-col) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>

        {/* Section 2: Monthly Trend */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Monthly Trend — Last 6 Months</div>
          {expenses.length === 0 && !summary ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>Loading...</div>
          ) : (
            <MonthlyTrendChart expenses={expenses} />
          )}
        </div>

        {/* Section 3: Category Breakdown */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Category Breakdown</div>
          {byCategory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byCategory.slice(0, 6).map(([cat, val]) => {
                const pct = Math.round(((val as number) / (catMax as number)) * 100)
                const color = CATEGORY_COLORS[cat] || '#8A8A94'
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-display)', color: '#F0F0FF', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                        {cat}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color }}>{inr(val as number)}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: color,
                        width: `${pct}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: Recent Expenses ── */}
      <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
        <div style={sectionLabel}>Recent Expenses</div>
        {!expenses.length ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(232,232,248,0.25)', fontSize: '13px' }}>No expenses yet. Add your first one!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <th style={{ ...colHeader, textAlign: 'left' }}>Date</th>
                <th style={{ ...colHeader, textAlign: 'center' }}>Category</th>
                <th style={{ ...colHeader, textAlign: 'left' }}>Description</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 10).map((exp: any, idx: number) => {
                const catColor = CATEGORY_COLORS[exp.category] || '#8A8A94'
                return (
                  <tr key={exp.id ?? idx} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(232,232,248,0.55)', textAlign: 'left' }}>{exp.date}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        background: `${catColor}22`,
                        color: catColor,
                        borderRadius: 100,
                        padding: '2px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '10px', fontSize: '12px', color: '#F0F0FF', textAlign: 'left' }}>{exp.description || '—'}</td>
                    <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A78BFA', textAlign: 'right' }}>{inr(Number(exp.amount))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Section 5 + 6: Subscriptions Due + Account Balances ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Section 5: Subscriptions Due */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Subscriptions Due</div>
          {subsNext3.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>No upcoming subscriptions</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subsNext3.map((sub: any) => {
                const days = daysUntil(sub.next_due_date)
                const urgent = days <= 3
                return (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: urgent ? 'rgba(255,68,68,0.06)' : 'rgba(124,58,237,0.06)',
                    border: `0.5px solid ${urgent ? 'rgba(255,68,68,0.2)' : 'rgba(124,58,237,0.15)'}`,
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-display)', color: '#F0F0FF', fontWeight: 600 }}>{sub.name}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(232,232,248,0.4)', marginTop: 2 }}>{sub.next_due_date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#A78BFA' }}>{inr(sub.amount)}</div>
                      <div style={{
                        fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-display)',
                        color: urgent ? '#FF4444' : 'rgba(232,232,248,0.4)',
                        marginTop: 2,
                      }}>{days === 0 ? 'Today' : days < 0 ? 'Overdue' : `${days}d`}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 6: Account Balances */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Account Balances</div>
          {accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>No accounts configured</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: accounts.length >= 3 ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 10 }}>
              {accounts.map((acc: any) => (
                <div key={acc.id} style={{
                  padding: '14px', borderRadius: 10,
                  background: 'rgba(124,58,237,0.06)',
                  border: '0.5px solid rgba(124,58,237,0.15)',
                }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.4)', marginBottom: 8 }}>{acc.type || acc.name}</div>
                  <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F0F0FF', lineHeight: 1 }}>{inr(acc.balance || 0)}</div>
                  {acc.type && acc.name !== acc.type && (
                    <div style={{ fontSize: '11px', color: 'rgba(232,232,248,0.35)', marginTop: 4, fontFamily: 'var(--font-body)' }}>{acc.name}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
