import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import ProductCard from '../../components/ui/ProductCard'
import { discountPercent } from '../../lib/catalogue'
import { formatDate, formatRupees } from '../../lib/format'
import { DEFAULT_PRICING_RULES, isVoucherExpired } from '../../lib/pricing'
import { getBlinkitAvailability, getCategories, getCoinBalance, getDarkStoreForPincode, getProducts, getUser, getVouchers } from '../../mocks'
import Shelf from './Shelf'

/**
 * Route:  /
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Home: the "Discover" stage of the user journey. Global Picks hero
 *         and "Trending in Korea" shelf, search, deals, categories, vouchers
 *         and a Coins teaser. Every tile deep-links into a filtered /products.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const store = getDarkStoreForPincode(getUser().defaultAddress.pincode)
  const coins = getCoinBalance()

  const products = getProducts()
  const trending = products
    .map((p) => ({ product: p, availability: getBlinkitAvailability(p.id) }))
    .filter((x) => x.availability)
    .sort((a, b) => b.product.rating - a.product.rating)
  const deals = products
    .filter((p) => discountPercent(p) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, 8)
  const vouchers = getVouchers().filter((v) => !isVoucherExpired(v))

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products')
  }

  return (
    <div>
      {/* Hero: Global Picks */}
      <section className="rounded-xl bg-linear-to-br from-brand to-brand-dark p-5 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">New · Shopee Global Picks × Blinkit</p>
        <h1 className="mt-2 max-w-xl text-2xl font-bold sm:text-3xl">
          Trending Korean beauty, delivered in {store ? `${store.avgDeliveryMinutes} minutes` : 'minutes'}
        </h1>
        <p className="mt-2 max-w-xl text-sm opacity-90 sm:text-base">
          Brand-authorised imports, pre-stocked at {store?.name ?? 'your nearest Blinkit store'}. Pay with ShopeePay and
          get {DEFAULT_PRICING_RULES.shopeePayCashbackPercent}% back in Shopee Coins.
        </p>
        <Link
          to="/products?blinkit=1"
          className="mt-4 inline-block rounded bg-white px-4 py-2 font-semibold text-brand hover:bg-brand-light"
        >
          Shop Global Picks
        </Link>
      </section>

      <form role="search" onSubmit={handleSearch} className="mt-4 flex gap-2">
        <label htmlFor="home-search" className="sr-only">
          Search products
        </label>
        <input
          id="home-search"
          name="q"
          type="search"
          placeholder="Search sunscreen, chargers, kurtas…"
          className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
        <button type="submit" className="rounded bg-brand px-4 font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
      </form>

      <Link
        to="/wallet"
        className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm shadow-sm hover:shadow-md"
      >
        <span>
          <span aria-hidden="true">🪙</span> You have <strong>{coins} Shopee Coins</strong>, worth {formatRupees(coins)} off
          your next orders
        </span>
        <span className="flex-none font-medium text-brand">Wallet →</span>
      </Link>

      <Shelf
        id="trending"
        title="Trending in Korea"
        subtitle={`Updated weekly · ${store ? `from ${store.name}` : 'from Blinkit'}`}
        seeAllTo="/products?blinkit=1"
      >
        {trending.map(({ product, availability }) => (
          <li key={product.id} className="flex w-40 flex-none snap-start sm:w-48">
            <ProductCard product={product} availability={availability} />
          </li>
        ))}
      </Shelf>

      <Shelf id="deals" title="Today's deals" subtitle="Biggest discounts first" seeAllTo="/products?deals=1&sort=discount">
        {deals.map((product) => (
          <li key={product.id} className="flex w-40 flex-none snap-start sm:w-48">
            <ProductCard product={product} availability={getBlinkitAvailability(product.id)} />
          </li>
        ))}
      </Shelf>

      <section aria-labelledby="categories" className="mt-8">
        <h2 id="categories" className="text-lg font-bold">
          Categories
        </h2>
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {getCategories().map((c) => (
            <li key={c.id}>
              <Link
                to={`/products?category=${c.id}`}
                className="flex flex-col items-center gap-1 rounded-lg bg-white p-2 text-center text-xs font-medium shadow-sm hover:text-brand hover:shadow-md sm:text-sm"
              >
                <img src={`/images/${c.id}.svg`} alt="" className="aspect-square w-full rounded" />
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vouchers" className="mt-8">
        <h2 id="vouchers" className="text-lg font-bold">
          Your vouchers
        </h2>
        <p className="text-sm text-gray-500">Pick one at checkout; only one applies per order.</p>
        <ul className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
          {vouchers.map((v) => (
            <li
              key={v.code}
              className="w-56 flex-none snap-start rounded-lg border-l-4 border-brand bg-white p-3 text-sm shadow-sm"
            >
              <p className="font-semibold">{v.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {v.minSpend ? `Min. spend ${formatRupees(v.minSpend)}` : 'No min. spend'} · till {formatDate(v.expiresAt)}
              </p>
              <p className="mt-2 font-mono text-xs text-brand">{v.code}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
