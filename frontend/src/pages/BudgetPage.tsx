import { useEffect, useState, type CSSProperties } from 'react'
import { budgetsAPI } from '@/services/api'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#FF6B35',
  Travel: '#4488FF',
  Bills: '#FFD700',
  Shopping: '#FF4488',
  Health: '#22DD88',
  Others: 'rgba(232,232,248,0.4)',
}

const ALL_CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Others']

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function BudgetPage() {
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [statusList, setStatusList] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [budgetForm, setBudgetForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    budgetsAPI.status({ month, year }).then((r) => {
      setStatusList(Array.isArray(r.data) ? r.data : [])
    }).catch(() => {})
    // Pre-fill modal form with existing limits
    budgetsAPI.list({ month, year }).then((r) => {
      const map: Record<string, string> = {}
      if (Array.isArray(r.data)) {
        r.data.forEach((b: any) => {
          map[b.category] = String(b.monthly_limit)
        })
      }
      setBudgetForm(map)
    }).catch(() => {})
  }

  useEffect(() => { load() }, [month, year])

  const openModal = () => setModal(true)

  const saveAll = async () => {
    setSaving(true)
    try {
      const promises = ALL_CATEGORIES
        .filter((cat) => budgetForm[cat] && parseFloat(budgetForm[cat]) > 0)
        .map((cat) =>
          budgetsAPI.upsert({
            category: cat,
            monthly_limit: parseFloat(budgetForm[cat]),
            month,
            year,
          })
        )
      await Promise.all(promises)
      setModal(false)
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

  // Merge all categories: show ones with budgets + ones without
  const allCats = ALL_CATEGORIES.map((cat) => {
    const found = statusList.find((s) => s.category === cat)
    return found || { category: cat, limit: 0, spent: 0, remaining: 0, pct: 0, status: 'ok' }
  })

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
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
            Budget
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        <button
          onClick={openModal}
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
        >
          Set Budgets
        </button>
      </div>

      {/* Budget cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
        }}
      >
        {allCats.map((b) => {
          const catColor = CATEGORY_COLORS[b.category] || 'rgba(232,232,248,0.4)'
          const hasLimit = b.limit > 0
          const pct = Math.min(b.pct, 100)
          const barColor =
            b.status === 'over'
              ? '#FF4444'
              : b.status === 'warning'
              ? '#FFD700'
              : '#22DD88'
          const statusEmoji =
            b.status === 'over' ? '🔴' : b.status === 'warning' ? '🟡' : '✅'

          return (
            <div
              key={b.category}
              className="cloud-fill"
              style={{
                ...glassCard,
                borderLeft: `3px solid ${catColor}`,
              }}
            >
              {/* Category header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: catColor,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#F0F0FF',
                    }}
                  >
                    {b.category}
                  </span>
                </div>
                {hasLimit && (
                  <span style={{ fontSize: '14px' }}>{statusEmoji}</span>
                )}
              </div>

              {hasLimit ? (
                <>
                  {/* Spent / Limit */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#F0F0FF',
                      }}
                    >
                      {inr(b.spent)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: 'rgba(232,232,248,0.5)',
                      }}
                    >
                      / {inr(b.limit)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: 8,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 5,
                      overflow: 'hidden',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 5,
                        background: barColor,
                        width: `${pct}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: barColor, fontWeight: 600 }}>{b.pct}%</span>
                    <span
                      style={{
                        color:
                          b.remaining < 0
                            ? '#FF4444'
                            : 'rgba(232,232,248,0.5)',
                      }}
                    >
                      {b.remaining >= 0
                        ? `${inr(b.remaining)} left`
                        : `${inr(Math.abs(b.remaining))} over`}
                    </span>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 0',
                    color: 'rgba(232,232,248,0.25)',
                    fontSize: '12px',
                  }}
                >
                  No budget set —{' '}
                  <span
                    onClick={openModal}
                    style={{ color: '#A78BFA', cursor: 'pointer' }}
                  >
                    Set limit
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Set Budgets Modal */}
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
              width: 400,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '16px',
                color: '#F0F0FF',
                marginBottom: 6,
              }}
            >
              Set Monthly Budgets
            </div>
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(232,232,248,0.4)',
                marginBottom: 20,
                fontFamily: 'var(--font-body)',
              }}
            >
              {MONTH_NAMES[month - 1]} {year} — Leave blank to skip a category
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ALL_CATEGORIES.map((cat) => {
                const catColor = CATEGORY_COLORS[cat] || 'rgba(232,232,248,0.4)'
                return (
                  <div
                    key={cat}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 90,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: catColor,
                          display: 'inline-block',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          color: '#F0F0FF',
                        }}
                      >
                        {cat}
                      </span>
                    </div>
                    <input
                      className="staax-input"
                      placeholder="₹ Limit"
                      value={budgetForm[cat] || ''}
                      onChange={(e) =>
                        setBudgetForm((f) => ({ ...f, [cat]: e.target.value }))
                      }
                      style={{ flex: 1 }}
                      type="number"
                      min="0"
                    />
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
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
                onClick={saveAll}
                disabled={saving}
                style={{
                  flex: 2,
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
                {saving ? 'Saving…' : 'Save All Budgets'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
