import { useEffect, useState, type CSSProperties } from 'react'
import { accountsAPI } from '@/services/api'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

const CREDIT_KEYWORDS = ['credit', 'cc', 'card']

function isCreditCard(name: string): boolean {
  const lower = (name || '').toLowerCase()
  return CREDIT_KEYWORDS.some((k) => lower.includes(k))
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', balance: '' })

  const load = () => {
    accountsAPI.list().then((r) => {
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
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name) return
    try {
      await accountsAPI.create({ name: form.name, balance: parseFloat(form.balance) || 0 })
      load()
      setModal(false)
      setForm({ name: '', balance: '' })
    } catch {}
  }

  // Net balance: credit cards count as negative
  const netBalance = accounts.reduce((sum, acc) => {
    const bal = acc.balance || 0
    return isCreditCard(acc.name) ? sum - bal : sum + bal
  }, 0)

  const glassCard: CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid var(--bx-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  }

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
            Accounts
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
            Manage your wallets & cards
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
          + Add Account
        </button>
      </div>

      {/* Net balance hero */}
      <div
        className="cloud-fill"
        style={{
          ...glassCard,
          marginBottom: 20,
          borderLeft: `3px solid ${netBalance >= 0 ? '#22DD88' : '#FF4444'}`,
        }}
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
          Net Balance
        </div>
        <div
          style={{
            fontSize: '28px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: netBalance >= 0 ? '#22DD88' : '#FF4444',
            lineHeight: 1,
          }}
        >
          {inr(Math.abs(netBalance))}
          {netBalance < 0 && (
            <span style={{ fontSize: '14px', color: '#FF4444', marginLeft: 6 }}>
              (net negative)
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(232,232,248,0.35)',
            marginTop: 4,
            fontFamily: 'var(--font-body)',
          }}
        >
          Assets minus credit card liabilities
        </div>
      </div>

      {/* Account cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        {accounts.map((acc) => {
          const isCC = isCreditCard(acc.name)
          const accentColor = isCC ? '#FF4444' : '#7C3AED'
          return (
            <div
              key={acc.id}
              className="cloud-fill"
              style={{
                ...glassCard,
                borderLeft: `3px solid ${accentColor}`,
                padding: '18px',
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
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(232,232,248,0.5)',
                  }}
                >
                  {acc.name}
                </div>
                {isCC && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#FF4444',
                      background: 'rgba(255,68,68,0.12)',
                      borderRadius: 4,
                      padding: '1px 6px',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    CREDIT
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isCC ? '#FF4444' : '#F0F0FF',
                  lineHeight: 1,
                }}
              >
                {isCC ? '−' : ''}{inr(acc.balance || 0)}
              </div>
            </div>
          )
        })}
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
              width: 320,
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
              Add Account
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="staax-input"
                placeholder="Account name (e.g. HDFC Bank, Credit Card)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ width: '100%' }}
              />
              <input
                className="staax-input"
                placeholder="Balance (₹)"
                value={form.balance}
                type="number"
                onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <p
              style={{
                fontSize: '10px',
                color: 'rgba(232,232,248,0.3)',
                marginTop: 8,
                fontFamily: 'var(--font-body)',
              }}
            >
              Tip: Names containing "credit" or "card" are treated as liabilities.
            </p>
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
