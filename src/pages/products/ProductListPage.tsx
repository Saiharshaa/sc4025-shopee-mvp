import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import ProductCard from '../../components/ui/ProductCard'
import { filterProducts, sortProducts } from '../../lib/catalogue'
import { getBlinkitAvailability, getCategories, getProducts } from '../../mocks'
import type { ProductSort } from '../../types'

/**
 * Route:  /products?q=&category=&blinkit=1&verified=1&deals=1&sort=
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Product listing, search and filters. Every choice lives in the URL,
 *         so home-page links, reloads and the back button all work. Matching
 *         and sorting rules live in src/lib/catalogue.ts.
 */

const SORTS: { id: ProductSort; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Top rated' },
  { id: 'discount', label: 'Biggest discount' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
]

const TOGGLES = [
  { param: 'blinkit', label: '⚡ Blinkit delivery' },
  { param: 'verified', label: 'Verified sellers' },
  { param: 'deals', label: 'On deal' },
] as const

export default function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const categories = getCategories()

  const query = params.get('q') ?? ''
  const category = categories.find((c) => c.id === params.get('category'))?.id ?? null
  const sort = SORTS.find((s) => s.id === params.get('sort'))?.id ?? 'relevance'
  const on = (param: string) => params.get(param) === '1'

  const products = getProducts()
  const availability = new Map(products.map((p) => [p.id, getBlinkitAvailability(p.id)]))
  const inStockNearby = new Set(products.filter((p) => (availability.get(p.id)?.units ?? 0) > 0).map((p) => p.id))

  const results = sortProducts(
    filterProducts(products, {
      query,
      category,
      onlyIds: on('blinkit') ? inStockNearby : null,
      verifiedOnly: on('verified'),
      dealsOnly: on('deals'),
    }),
    sort,
    query,
  )

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const heading = query ? `Results for “${query}”` : (categories.find((c) => c.id === category)?.label ?? 'All products')
  const filtersActive = Boolean(query || category || TOGGLES.some((t) => on(t.param)))

  return (
    <section>
      <h1 className="text-2xl font-bold">{heading}</h1>

      <form role="search" className="mt-3" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Search sunscreen, chargers, kurtas…"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </form>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Category">
        <Chip selected={category === null} onClick={() => update('category', null)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} selected={category === c.id} onClick={() => update('category', c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {TOGGLES.map((t) => (
          <Chip key={t.param} selected={on(t.param)} onClick={() => update(t.param, on(t.param) ? null : '1')}>
            {t.label}
          </Chip>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          Sort
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value === 'relevance' ? null : e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-sm text-gray-500" aria-live="polite">
        {results.length} {results.length === 1 ? 'product' : 'products'}
      </p>

      {results.length > 0 ? (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <li key={p.id} className="flex">
              <ProductCard product={p} availability={availability.get(p.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="font-medium">No products match.</p>
          {filtersActive && (
            <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-3 text-brand underline">
              Clear search and filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex-none whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${
        selected ? 'border-brand bg-brand-light text-brand' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  )
}
