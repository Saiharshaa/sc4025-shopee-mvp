import { Outlet } from 'react-router'
import Header from './Header'

/**
 * App shell wrapping every route.
 * OWNER: Person 4 (Tech Lead). Person 3 may restyle it via PR.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        SC4025 prototype · mock data only, no real transactions
      </footer>
    </div>
  )
}
