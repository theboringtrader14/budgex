import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

// ---- SVG Icons (18×18, stroke-based) ----
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="6" height="6" rx="1.5" />
    <rect x="10" y="2" width="6" height="6" rx="1.5" />
    <rect x="2" y="10" width="6" height="6" rx="1.5" />
    <rect x="10" y="10" width="6" height="6" rx="1.5" />
  </svg>
)

const IconAddExpense = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <line x1="9" y1="6" x2="9" y2="12" />
    <line x1="6" y1="9" x2="12" y2="9" />
  </svg>
)

const IconExpenses = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="2" />
    <line x1="6" y1="6" x2="12" y2="6" />
    <line x1="6" y1="9" x2="12" y2="9" />
    <line x1="6" y1="12" x2="9" y2="12" />
  </svg>
)

const IconAccounts = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="16" x2="16" y2="16" />
    <rect x="4" y="9" width="3" height="7" />
    <rect x="7.5" y="6" width="3" height="10" />
    <rect x="11" y="11" width="3" height="5" />
    <polyline points="2,7 9,2 16,7" />
  </svg>
)

const IconSubscriptions = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3v4h-4" />
    <path d="M2 15v-4h4" />
    <path d="M14.5 7A6 6 0 0 0 4 7.5" />
    <path d="M3.5 11A6 6 0 0 0 14 10.5" />
  </svg>
)

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="10,4 6,8 10,12" />
  </svg>
)

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z" />
  </svg>
)

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="3" />
    <line x1="8" y1="1" x2="8" y2="3" />
    <line x1="8" y1="13" x2="8" y2="15" />
    <line x1="1" y1="8" x2="3" y2="8" />
    <line x1="13" y1="8" x2="15" y2="8" />
    <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" />
    <line x1="11.54" y1="11.54" x2="12.95" y2="12.95" />
    <line x1="3.05" y1="12.95" x2="4.46" y2="11.54" />
    <line x1="11.54" y1="4.46" x2="12.95" y2="3.05" />
  </svg>
)

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <line x1="3" y1="5" x2="15" y2="5" />
    <line x1="3" y1="9" x2="15" y2="9" />
    <line x1="3" y1="13" x2="15" y2="13" />
  </svg>
)

// ---- Nav config ----
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', Icon: IconDashboard, end: true },
  { path: '/add', label: 'Add Expense', Icon: IconAddExpense },
  { path: '/expenses', label: 'Expenses', Icon: IconExpenses },
  { path: '/accounts', label: 'Accounts', Icon: IconAccounts },
  { path: '/subscriptions', label: 'Subscriptions', Icon: IconSubscriptions },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/add': 'Add Expense',
  '/expenses': 'Expenses',
  '/accounts': 'Accounts',
  '/subscriptions': 'Subscriptions',
}

// ---- Component ----
export default function Layout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'BUDGEX'

  // Sidebar mobile open
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sidebar collapsed (desktop)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('budgex_sidebar_collapsed') === 'true'
  })

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('budgex_theme') as 'dark' | 'light') ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('budgex_theme', theme)
  }, [theme])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('budgex_sidebar_collapsed', String(next))
      return next
    })
  }

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={[
        'sidebar',
        collapsed ? 'collapsed' : '',
        sidebarOpen ? 'open' : '',
      ].filter(Boolean).join(' ')}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <span className="sidebar-logo-text">BUDGEX</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, label, Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="sidebar-toggle">
          <button
            className="sidebar-toggle-btn"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="sidebar-toggle-icon"><IconChevronLeft /></span>
            <span className="sidebar-toggle-label">Collapse</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`main-wrapper${collapsed ? ' collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(s => !s)}
              aria-label="Menu"
            >
              <IconMenu />
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <span className="topbar-version">v1.0</span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(({ path, label, Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><Icon /></span>
            <span>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
