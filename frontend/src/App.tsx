import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import ExpensesPage from '@/pages/ExpensesPage'
import AccountsPage from '@/pages/AccountsPage'
import SubscriptionsPage from '@/pages/SubscriptionsPage'
import BudgexAnalyticsPage from '@/pages/AnalyticsPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="subs" element={<SubscriptionsPage />} />
          <Route path="analytics" element={<BudgexAnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
