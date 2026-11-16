import { Link, NavLink } from 'react-router'
import { useCart } from '../../context/useCart'
import { useRole } from '../../context/useRole'

/**
 * Shared header + primary nav.
 * OWNER: Person 4 (Tech Lead). Person 3 may restyle it via PR.
 *
 * Shoppers get the five destinations from the report (Section 2.4): inline in
 * the header from 640px up, as a bottom tab bar on phones. Partners get the
 * dashboard only. Both can switch role.
 */

const SHOPPER_NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/products', label: 'Search', icon: '🔍', end: false },
  { to: '/cart', label: 'Cart', icon: '🛒', end: false },
  { to: '/orders', label: 'Orders', icon: '📦', end: false },
  { to: '/wallet', label: 'Rewards', icon: '🪙', end: false },
]

export default function Header() {
  const { role, setRole } = useRole()
  const { itemCount } = useCart()

  const badge = (to: string) =>
    to === '/cart' &&
    itemCount > 0 && (
      <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold leading-none text-brand">
        <span className="sr-only">, items: </span>
        {itemCount}
      </span>
    )

  return (
    <>
      <header className="sticky top-0 z-20 bg-brand text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:py-3">
          <Link to={role === 'partner' ? '/inventory' : '/'} className="flex-none text-xl font-bold tracking-tight">
            Shopee{' '}
            <span className="text-sm font-medium opacity-80">{role === 'partner' ? 'Partner' : 'India'}</span>
          </Link>

          {role === 'shopper' && (
            <nav aria-label="Primary" className="hidden sm:block">
              <ul className="flex gap-1 text-sm font-medium">
                {SHOPPER_NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center rounded px-3 py-1.5 transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
                      }
                    >
                      {item.label}
                      {badge(item.to)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {role && (
            <button
              type="button"
              onClick={() => setRole(null)}
              className="flex-none rounded border border-white/40 px-2 py-1 text-xs font-medium hover:bg-white/10"
            >
              Switch role
            </button>
          )}
        </div>
      </header>

      {role === 'shopper' && (
        <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white sm:hidden">
          <ul className="grid grid-cols-5 text-[11px] font-medium">
            {SHOPPER_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 ${isActive ? 'text-brand' : 'text-gray-600'}`
                  }
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    {item.icon}
                  </span>
                  <span className="flex items-center">
                    {item.label}
                    {item.to === '/cart' && itemCount > 0 && (
                      <span className="ml-0.5 rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                        <span className="sr-only">, items: </span>
                        {itemCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
