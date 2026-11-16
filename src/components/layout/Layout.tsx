import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useRole } from '../../context/useRole'
import { useCashbackCrediting } from '../../hooks/useCashbackCrediting'
import DemoPanel from './DemoPanel'
import Header from './Header'
import RolePicker from './RolePicker'

/**
 * App shell wrapping every route.
 * OWNER: Person 4 (Tech Lead). Person 3 may restyle it via PR.
 *
 * Until a role is picked, the start screen replaces the page (the URL is kept,
 * so the requested page opens afterwards). Partners only see the dashboard;
 * shoppers can't open it.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const { role } = useRole()
  useCashbackCrediting()

  // A new page starts at the top (e.g. clicking a related product further down).
  // Keyed on pathname only, so changing filters in the query string doesn't jump.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const onDashboard = pathname === '/inventory'
  if (role === 'partner' && !onDashboard) return <Navigate to="/inventory" replace />
  if (role === 'shopper' && onDashboard) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 ${role === 'shopper' ? 'pb-24 sm:pb-6' : ''}`}>
        {role ? <Outlet /> : <RolePicker />}
      </main>
      <footer
        className={`border-t border-gray-200 py-4 text-center text-xs text-gray-400 ${role === 'shopper' ? 'mb-16 sm:mb-0' : ''}`}
      >
        SC4025 prototype · mock data only, no real transactions
      </footer>
      {role === 'shopper' && <DemoPanel />}
    </div>
  )
}
