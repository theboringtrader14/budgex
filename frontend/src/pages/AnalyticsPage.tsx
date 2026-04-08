import { useEffect, useState, type CSSProperties } from 'react'
import { expensesAPI, analyticsAPI } from '@/services/api'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B35',
  Travel: '#4488FF',
  Bills: '#FFD700',
  Shopping: '#FF4488',
  Health: '#22DD88',
  Others: 'rgba(232,232,248,0.4)',
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const VIVID = '#7C3AED'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

/* ── Bar chart component (SVG) ───────────────────── */
function BarChart({ bars, color = VIVID }: { bars: { label: string; value: number }[]; color?: string }) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (!bars.length) return null
  const maxVal = Math.max(...bars.map((b) => b.value), 1)
  const count = bars.length
  const chartW = Math.min(count * 60, 560)
  const chartH = 100
  const barW = Math.min(36, Math.floor((chartW / count) * 0.6))
  const gap = (chartW - barW * count) / (count + 1)
  const labelY = chartH + 18

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={chartW + gap * 2} height={chartH + 32} style={{ display: 'block', margin: '0 auto' }}>
        {bars.map((b, i) => {
          const x = gap + i * (barW + gap)
          const barH = Math.max(4, Math.round((b.value / maxVal) * chartH))
          const y = chartH - barH
          const isHov = hovered === i
          return (
            <g
              key={b.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              <rect
                x={x} y={y} width={barW} height={barH} rx={4}
                fill={isHov ? '#9D5FF0' : color}
                opacity={isHov ? 1 : 0.82}
                style={{ transition: 'fill 0.15s, opacity 0.15s' }}
              />
              <text
                x={x + barW / 2} y={labelY}
                textAnchor="middle" fontSize={9}
                fill="rgba(232,232,248,0.5)"
                fontFamily="var(--font-display)"
              >
                {b.label}
              </text>
              {isHov && b.value > 0 && (
                <g>
                  <rect
                    x={x + barW / 2 - 32} y={y - 28}
                    width={64} height={20} rx={4}
                    fill="rgba(18,18,28,0.95)"
                    stroke="rgba(124,58,237,0.4)" strokeWidth={0.5}
                  />
                  <text
                    x={x + barW / 2} y={y - 14}
                    textAnchor="middle" fontSize={9} fontWeight={600}
                    fill="#A78BFA" fontFamily="var(--font-mono)"
                  >
                    {inr(b.value)}
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

export default function BudgexAnalyticsPage() {
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly')
  const [trends, setTrends] = useState<any[]>([])
  const [insight, setInsight] = useState<string | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear] = useState(now.getFullYear())

  useEffect(() => {
    expensesAPI.trends(12).then((r) => setTrends(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    loadInsight()
  }, [])

  const loadInsight = () => {
    setInsightLoading(true)
    analyticsAPI.insights()
      .then((r) => setInsight(r.data?.insight || null))
      .catch(() => setInsight('Your spending this month is on track.'))
      .finally(() => setInsightLoading(false))
  }

  // Monthly tab data
  const monthData = trends.find((t) => t.month === selectedMonth && t.year === selectedYear)
  const prevMonthIdx = selectedMonth === 1 ? 12 : selectedMonth - 1
  const prevMonthYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
  const prevMonthData = trends.find((t) => t.month === prevMonthIdx && t.year === prevMonthYear)

  // Daily spend bars for selected month (from trends — approximate with flat distribution)
  // We'll show the by_category breakdown as horizontal bars for monthly
  const monthCats: [string, number][] = monthData?.by_category
    ? (Object.entries(monthData.by_category) as [string, number][]).sort((a, b) => b[1] - a[1])
    : []
  const monthCatMax = monthCats.length ? Math.max(...monthCats.map(([, v]) => v)) : 1

  // Last month comparison
  const thisTotal = monthData?.total || 0
  const lastTotal = prevMonthData?.total || 0
  const diff = thisTotal - lastTotal
  const diffPct = lastTotal > 0 ? Math.round((diff / lastTotal) * 100) : 0

  // Yearly tab: all months bars
  const yearBars = MONTHS_SHORT.map((label, i) => {
    const m = i + 1
    const t = trends.find((tr) => tr.month === m && tr.year === selectedYear)
    return { label, value: t?.total || 0 }
  })
  const bestIdx = yearBars.reduce((bi, b, i) => (b.value > yearBars[bi].value ? i : bi), 0)
  const worstNonZeroIdx = yearBars.reduce((wi, b, i) => {
    if (b.value === 0) return wi
    return wi === -1 || b.value < yearBars[wi].value ? i : wi
  }, -1)

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  }

  const sectionLabel: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '13px',
    color: '#F0F0FF',
    marginBottom: 14,
  }

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
            Analytics
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            Spending patterns & insights
          </p>
        </div>
        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid var(--bx-border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {(['monthly', 'yearly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: tab === t ? '#A78BFA' : 'rgba(232,232,248,0.4)',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights card */}
      <div
        className="cloud-fill"
        style={{
          ...glassCard,
          border: '0.5px solid rgba(124,58,237,0.35)',
          background: 'rgba(124,58,237,0.08)',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.8">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '13px',
                color: '#A78BFA',
              }}
            >
              AI Insight
            </span>
          </div>
          <button
            onClick={loadInsight}
            disabled={insightLoading}
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '0.5px solid rgba(124,58,237,0.35)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '10px',
              color: '#A78BFA',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}
          >
            {insightLoading ? 'Thinking…' : 'Refresh'}
          </button>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: '#F0F0FF',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
          }}
        >
          {insightLoading
            ? 'Analyzing your spending patterns…'
            : insight || 'Your spending this month is on track.'}
        </p>
      </div>

      {/* Monthly tab */}
      {tab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Month selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MONTHS_SHORT.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i + 1)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '11px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  border: selectedMonth === i + 1 ? '0.5px solid rgba(124,58,237,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
                  background: selectedMonth === i + 1 ? 'rgba(124,58,237,0.18)' : 'transparent',
                  color: selectedMonth === i + 1 ? '#A78BFA' : 'rgba(232,232,248,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* This month vs last month comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              className="cloud-fill"
              style={{ ...glassCard, borderLeft: '3px solid #7C3AED' }}
            >
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.45)', marginBottom: 8 }}>
                {MONTHS_SHORT[selectedMonth - 1]} {selectedYear}
              </div>
              <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F0F0FF' }}>
                {inr(thisTotal)}
              </div>
            </div>
            <div
              className="cloud-fill"
              style={{
                ...glassCard,
                borderLeft: `3px solid ${diff > 0 ? '#FF4444' : '#22DD88'}`,
              }}
            >
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,232,248,0.45)', marginBottom: 8 }}>
                vs {MONTHS_SHORT[prevMonthIdx - 1]}
              </div>
              <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: diff > 0 ? '#FF4444' : '#22DD88' }}>
                {diff > 0 ? '+' : ''}{diffPct}%
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(232,232,248,0.4)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {inr(Math.abs(diff))} {diff > 0 ? 'more' : 'less'}
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="cloud-fill" style={glassCard}>
            <div style={sectionLabel}>Category Breakdown — {MONTHS_SHORT[selectedMonth - 1]}</div>
            {monthCats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(232,232,248,0.25)', fontSize: '12px' }}>
                No data for this month
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {monthCats.map(([cat, val]) => {
                  const color = CATEGORY_COLORS[cat] || 'rgba(232,232,248,0.4)'
                  const pct = Math.round((val / monthCatMax) * 100)
                  const pctOfTotal = thisTotal > 0 ? Math.round((val / thisTotal) * 100) : 0
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        <span style={{ flex: 1, fontSize: '12px', fontFamily: 'var(--font-display)', color: '#F0F0FF' }}>{cat}</span>
                        <span style={{ fontSize: '10px', color: 'rgba(232,232,248,0.4)', fontFamily: 'var(--font-mono)' }}>{pctOfTotal}%</span>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color, minWidth: 70, textAlign: 'right' }}>
                          {inr(val)}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${pct}%`, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yearly tab */}
      {tab === 'yearly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="cloud-fill" style={glassCard}>
            <div style={sectionLabel}>All Months — {selectedYear}</div>
            <BarChart bars={yearBars} color={VIVID} />

            {/* Best / worst */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,221,136,0.06)', border: '0.5px solid rgba(34,221,136,0.2)' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(34,221,136,0.7)', marginBottom: 4 }}>
                  Best Month (Lowest)
                </div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22DD88' }}>
                  {worstNonZeroIdx >= 0 ? MONTHS_SHORT[worstNonZeroIdx] : '—'}{' '}
                  <span style={{ fontSize: '12px', color: 'rgba(232,232,248,0.5)' }}>
                    {worstNonZeroIdx >= 0 ? inr(yearBars[worstNonZeroIdx].value) : ''}
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,68,68,0.06)', border: '0.5px solid rgba(255,68,68,0.2)' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,68,68,0.7)', marginBottom: 4 }}>
                  Worst Month (Highest)
                </div>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FF4444' }}>
                  {yearBars[bestIdx]?.value > 0 ? MONTHS_SHORT[bestIdx] : '—'}{' '}
                  <span style={{ fontSize: '12px', color: 'rgba(232,232,248,0.5)' }}>
                    {yearBars[bestIdx]?.value > 0 ? inr(yearBars[bestIdx].value) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
