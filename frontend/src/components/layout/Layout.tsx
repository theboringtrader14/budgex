import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'

const NAV = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/expenses',
    label: 'Expenses',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    path: '/budget',
    label: 'Budget',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/subs',
    label: 'Subscriptions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 1l4 4-4 4"/>
        <path d="M3 11V9a4 4 0 014-4h14"/>
        <path d="M7 23l-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
  },
  {
    path: '/accounts',
    label: 'Accounts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 3H8L2 7h20l-6-4z"/>
        <line x1="6" y1="13" x2="10" y2="13"/>
      </svg>
    ),
  },
]

function ISTClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--bx-vivid)',
        letterSpacing: '0.04em',
      }}
    >
      IST {time}
    </span>
  )
}

export default function Layout() {
  const loc = useLocation()
  const nav = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        position: 'relative',
      }}
    >
      {/* Ambient orbs */}
      <div
        className="bg-orb-1"
        style={{
          position: 'fixed',
          width: 600,
          height: 600,
          borderRadius: '50%',
          top: -200,
          left: -100,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        className="bg-orb-2"
        style={{
          position: 'fixed',
          width: 500,
          height: 500,
          borderRadius: '50%',
          bottom: -150,
          right: -100,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sidebar */}
      <aside
        style={{
          width: 56,
          flexShrink: 0,
          height: '100vh',
          background: 'rgba(10,10,14,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '0.5px solid var(--bx-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 4,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '13px',
            color: '#fff',
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          BX
        </div>

        {/* Nav items */}
        {NAV.map((item) => {
          const active =
            loc.pathname === item.path ||
            (item.path === '/dashboard' && loc.pathname === '/')
          return (
            <div
              key={item.path}
              title={item.label}
              onClick={() => nav(item.path)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? '#A78BFA' : 'rgba(232,232,248,0.35)',
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                borderLeft: active ? '2px solid #7C3AED' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLDivElement).style.color =
                    'rgba(167,139,250,0.7)'
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLDivElement).style.color =
                    'rgba(232,232,248,0.35)'
              }}
            >
              {item.icon}
            </div>
          )
        })}
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* TopBar */}
        <div
          style={{
            height: '52px',
            minHeight: '52px',
            flexShrink: 0,
            background: 'rgba(10,10,14,0.94)',
            backdropFilter: 'blur(20px)',
            borderBottom: '0.5px solid rgba(124,58,237,0.16)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(240,237,232,0.38)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Welcome,{' '}
              <span style={{ color: '#F0EDE8', fontWeight: 600 }}>
                Karthikeyan
              </span>
            </span>
            <span
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(124,58,237,0.30)',
                display: 'inline-block',
              }}
            />
            <ISTClock />
          </div>
          <div style={{ flex: 1 }} />
          {/* BUDGEX pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(124,58,237,0.12)',
              border: '0.5px solid var(--bx-border)',
              borderRadius: 100,
              padding: '3px 10px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#7C3AED',
                animation: 'orbPulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#A78BFA',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.08em',
              }}
            >
              BUDGEX
            </span>
          </div>
          <button
            onClick={() => (window.location.href = 'https://lifexos.co.in')}
            style={{
              background: 'transparent',
              border: '0.5px solid rgba(232,232,248,0.12)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '11px',
              color: 'rgba(232,232,248,0.4)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
