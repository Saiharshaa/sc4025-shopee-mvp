import { Link, NavLink } from 'react-router'
import { useCart } from '../../context/useCart'

/**
 * Shared header + primary nav.
 * OWNER: Person 4 (Tech Lead). Person 3 may restyle it via PR.
 */

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/wallet', label: 'Wallet', end: false },
  { to: '/cart', label: 'Cart', end: false },
]

export default function Header() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:py-3">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Shopee <span className="text-sm font-medium opacity-80">India</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex gap-0.5 text-sm font-medium sm:gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded px-2 py-1.5 transition-colors sm:px-3 ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
                  }
                >
                  {item.label}
                  {item.to === '/cart' && itemCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-brand">
                      <span className="sr-only">, items: </span>
                      {itemCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
