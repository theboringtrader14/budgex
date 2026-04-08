import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import ExpensesPage from '@/pages/ExpensesPage'
import BudgetPage from '@/pages/BudgetPage'
import BudgexAnalyticsPage from '@/pages/AnalyticsPage'
import SubscriptionsPage from '@/pages/SubscriptionsPage'
import AccountsPage from '@/pages/AccountsPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="analytics" element={<BudgexAnalyticsPage />} />
          <Route path="subs" element={<SubscriptionsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
