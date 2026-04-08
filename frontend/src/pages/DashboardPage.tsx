import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI, subscriptionsAPI, budgetsAPI } from '@/services/api'

/* ── Design constants ───────────────────────────── */
const VIVID = '#7C3AED'
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B35',
  Travel: '#4488FF',
  Bills: '#FFD700',
  Shopping: '#FF4488',
  Health: '#22DD88',
  Others: 'rgba(232,232,248,0.4)',
}

const glass: CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid var(--bx-border)',
  borderRadius: 'var(--radius-lg)',
}

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

function dayLabel(dateStr: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const d = new Date(dateStr)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/* ── Monthly Trend SVG bar chart ────────────────── */
function MonthlyTrendChart({ trends }: { trends: any[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (!trends.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>
        Loading...
      </div>
    )
  }
  const maxVal = Math.max(...trends.map((t) => t.total), 1)
  const chartW = 460
  const chartH = 120
  const barW = 40
  const gap = (chartW - barW * 6) / 7
  const labelY = chartH + 18

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        width={chartW + gap * 2}
        height={chartH + 36}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {trends.map((t, i) => {
          const x = gap + i * (barW + gap)
          const barH = Math.max(4, Math.round((t.total / maxVal) * chartH))
          const y = chartH - barH
          const isHov = hovered === i
          const label = t.label.split(' ')[0] // "Apr 2026" → "Apr"
          return (
            <g
              key={`${t.month}-${t.year}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={5}
                fill={isHov ? '#9D5FF0' : VIVID}
                opacity={isHov ? 1 : 0.82}
                style={{ transition: 'fill 0.15s, opacity 0.15s' }}
              />
              <text
                x={x + barW / 2}
                y={labelY}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(232,232,248,0.5)"
                fontFamily="var(--font-display)"
              >
                {label}
              </text>
              {isHov && t.total > 0 && (
                <g>
                  <rect
                    x={x + barW / 2 - 34}
                    y={y - 30}
                    width={68}
                    height={22}
                    rx={5}
                    fill="rgba(18,18,28,0.95)"
                    stroke="rgba(124,58,237,0.4)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={x + barW / 2}
                    y={y - 14}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill="#A78BFA"
                    fontFamily="var(--font-mono)"
                  >
                    {inr(t.total)}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Budget Status Bar ───────────────────────────── */
function BudgetStatusBar({ budgetStatus }: { budgetStatus: any[] }) {
  if (!budgetStatus.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '16px 0',
          color: 'rgba(232,232,248,0.3)',
          fontSize: '12px',
        }}
      >
        No budget set for this month.{' '}
        <a href="/budget" style={{ color: '#A78BFA', textDecoration: 'none' }}>
          Set budgets →
        </a>
      </div>
    )
  }
  const totalLimit = budgetStatus.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgetStatus.reduce((s, b) => s + b.spent, 0)
  const pct = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0
  const color = pct >= 100 ? '#FF4444' : pct >= 80 ? '#FFD700' : '#22DD88'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ color: '#F0F0FF', fontWeight: 600 }}>
          {inr(totalSpent)} of {inr(totalLimit)}
        </span>
        <span style={{ color }}>{pct}% used</span>
      </div>
      <div
        style={{
          height: 10,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 6,
            background: color,
            width: `${pct}%`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {budgetStatus.map((b) => {
          const catColor = CATEGORY_COLORS[b.category] || 'rgba(232,232,248,0.4)'
          const s = b.status as string
          const statusColor = s === 'over' ? '#FF4444' : s === 'warning' ? '#FFD700' : '#22DD88'
          return (
            <div
              key={b.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 100,
                background: `${catColor}18`,
                border: `0.5px solid ${catColor}44`,
                fontSize: '10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
              }}
            >
              <span style={{ color: catColor }}>{b.category}</span>
              <span style={{ color: statusColor }}>{b.pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────── */
export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [budgetStatus, setBudgetStatus] = useState<any[]>([])

  useEffect(() => {
    expensesAPI.summary().then((r) => setSummary(r.data)).catch(() => {})
    expensesAPI.list({ limit: 15 }).then((r) => setExpenses(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    subscriptionsAPI.list().then((r) => setSubs(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    expensesAPI.trends(6).then((r) => setTrends(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    expensesAPI.merchants({ limit: 5 }).then((r) => setMerchants(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    budgetsAPI.status().then((r) => setBudgetStatus(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  /* ── Derived values ── */
  const today = summary?.today ?? 0
  const monthly = summary?.monthly ?? 0
  const byCategory: [string, number][] = summary?.by_category
    ? (Object.entries(summary.by_category) as [string, number][]).sort((a, b) => b[1] - a[1])
    : []
  const topCat = byCategory[0]?.[0] ?? '—'
  const catMax = byCategory[0]?.[1] ?? 1

  const now = new Date()
  const subsUpcoming7 = subs.filter((s) => {
    if (!s.next_due_date) return false
    const d = daysUntil(s.next_due_date)
    return d >= 0 && d <= 7
  })
  const subsNext3 = [...subs]
    .filter((s) => s.next_due_date)
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 3)

  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  /* ── Group expenses by day ── */
  const groupedExpenses: Record<string, any[]> = {}
  expenses.forEach((exp) => {
    const key = exp.date || 'Unknown'
    if (!groupedExpenses[key]) groupedExpenses[key] = []
    groupedExpenses[key].push(exp)
  })
  const groupedDays = Object.entries(groupedExpenses).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  )

  /* ── Summary cards ── */
  const summaryCards = [
    {
      label: 'TODAY',
      value: inr(today),
      sub: new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      color: '#A78BFA',
    },
    {
      label: 'THIS MONTH',
      value: inr(monthly),
      sub: monthLabel,
      color: VIVID,
    },
    {
      label: 'TOP CATEGORY',
      value: topCat,
      sub: byCategory[0] ? inr(byCategory[0][1]) : '—',
      color: CATEGORY_COLORS[topCat] || 'rgba(232,232,248,0.4)',
    },
    {
      label: 'SUBS DUE',
      value: String(subsUpcoming7.length),
      sub: 'in next 7 days',
      color: subsUpcoming7.length > 0 ? '#FF4444' : '#22DD88',
    },
  ]

  const sectionLabel: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '13px',
    color: '#F0F0FF',
    marginBottom: 16,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: VIVID }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            Financial overview — {monthLabel}
          </p>
        </div>
      </div>

      {/* Section A: 4 summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="cloud-fill"
            style={{ ...glass, padding: '18px 20px', borderLeft: `3px solid ${c.color}` }}
          >
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(232,232,248,0.45)',
                marginBottom: 8,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: '#F0F0FF',
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {c.value}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(232,232,248,0.35)', fontFamily: 'var(--font-body)' }}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Section B: Budget progress bar */}
      <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
        <div style={{ ...sectionLabel, marginBottom: 12 }}>
          Monthly Budget Overview
          <a
            href="/budget"
            style={{
              marginLeft: 12,
              fontSize: '10px',
              color: '#A78BFA',
              textDecoration: 'none',
              fontWeight: 400,
            }}
          >
            Manage →
          </a>
        </div>
        <BudgetStatusBar budgetStatus={budgetStatus} />
      </div>

      {/* Section C: Monthly Trend */}
      <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
        <div style={sectionLabel}>Monthly Trend — Last 6 Months</div>
        <MonthlyTrendChart trends={trends} />
      </div>

      {/* Section D: Category breakdown + Top Merchants */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Category breakdown */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Category Breakdown</div>
          {byCategory.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'rgba(232,232,248,0.25)',
                fontSize: '12px',
              }}
            >
              No data yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byCategory.slice(0, 6).map(([cat, val]) => {
                const pct = Math.round((val / catMax) * 100)
                const color = CATEGORY_COLORS[cat] || 'rgba(232,232,248,0.4)'
                const totalAll = byCategory.reduce((s, [, v]) => s + v, 0)
                const pctOfTotal = totalAll > 0 ? Math.round((val / totalAll) * 100) : 0
                return (
                  <div key={cat}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: '12px',
                          fontFamily: 'var(--font-display)',
                          color: '#F0F0FF',
                        }}
                      >
                        {cat}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'rgba(232,232,248,0.4)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {pctOfTotal}%
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color,
                          minWidth: 60,
                          textAlign: 'right',
                        }}
                      >
                        {inr(val)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 3,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          background: color,
                          width: `${pct}%`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Merchants */}
        <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
          <div style={sectionLabel}>Top Merchants</div>
          {merchants.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'rgba(232,232,248,0.25)',
                fontSize: '12px',
              }}
            >
              No merchant data yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {merchants.map((m: any, idx: number) => {
                const catColor = CATEGORY_COLORS[m.category] || 'rgba(232,232,248,0.4)'
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: `${catColor}22`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: catColor,
                          flexShrink: 0,
                        }}
                      >
                        {(m.description || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#F0F0FF',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.description || '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 600,
                              color: catColor,
                              background: `${catColor}18`,
                              borderRadius: 4,
                              padding: '1px 6px',
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            {m.category}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(232,232,248,0.35)' }}>
                            {m.count}x
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#A78BFA',
                        flexShrink: 0,
                      }}
                    >
                      {inr(m.total)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section E: Recent expenses grouped by day */}
      <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
        <div style={sectionLabel}>Recent Expenses</div>
        {groupedDays.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              color: 'rgba(232,232,248,0.25)',
              fontSize: '13px',
            }}
          >
            No expenses yet. Add your first one!
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
                    color: 'rgba(232,232,248,0.4)',
                    marginBottom: 8,
                    paddingBottom: 4,
                    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {dayLabel(dateStr)}
                  <span
                    style={{
                      marginLeft: 8,
                      color: '#A78BFA',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {inr(exps.reduce((s: number, e: any) => s + Number(e.amount), 0))}
                  </span>
                </div>
                {exps.map((exp: any, idx: number) => {
                  const catColor = CATEGORY_COLORS[exp.category] || 'rgba(232,232,248,0.4)'
                  return (
                    <div
                      key={exp.id ?? idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 0',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span
                        style={{
                          background: `${catColor}22`,
                          color: catColor,
                          borderRadius: 6,
                          padding: '2px 8px',
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
                        }}
                      >
                        {inr(Number(exp.amount))}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section F: Subscriptions due */}
      <div className="cloud-fill" style={{ ...glass, padding: '20px' }}>
        <div style={sectionLabel}>Subscriptions Due</div>
        {subsNext3.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'rgba(232,232,248,0.25)',
              fontSize: '12px',
            }}
          >
            No upcoming subscriptions
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subsNext3.map((sub: any) => {
              const days = daysUntil(sub.next_due_date)
              const isRed = days <= 3
              const isAmber = days <= 7 && !isRed
              const dotColor = isRed ? '#FF4444' : isAmber ? '#FFD700' : 'rgba(232,232,248,0.3)'
              return (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: isRed
                      ? 'rgba(255,68,68,0.06)'
                      : 'rgba(124,58,237,0.06)',
                    border: `0.5px solid ${isRed ? 'rgba(255,68,68,0.2)' : 'rgba(124,58,237,0.15)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontFamily: 'var(--font-display)',
                          color: '#F0F0FF',
                          fontWeight: 600,
                        }}
                      >
                        {sub.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'rgba(232,232,248,0.4)',
                          marginTop: 2,
                        }}
                      >
                        {sub.next_due_date}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#A78BFA',
                      }}
                    >
                      {inr(sub.amount)}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                        color: dotColor,
                        marginTop: 2,
                      }}
                    >
                      {days === 0 ? 'Today' : days < 0 ? 'Overdue' : `${days}d`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
