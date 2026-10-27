import { useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router'
import { getDarkStores, getStockRecords, getVendors } from '../../mocks'
import DarkStoreTab from './DarkStoreTab'
import VendorTab from './VendorTab'

/**
 * Route:  /inventory           (?tab=stores opens the dark-store tab)
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Which brand-authorised importer keeps which Global Picks product in
 *         which Blinkit dark store, with its import registration and unit
 *         counts. Status rules (low stock, renewal due) live in src/lib/inventory.ts.
 */

const TABS = [
  { id: 'vendors', label: 'By vendor' },
  { id: 'stores', label: 'By dark store' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function InventoryPage() {
  const [params, setParams] = useSearchParams()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const active: TabId = params.get('tab') === 'stores' ? 'stores' : 'vendors'

  const vendors = getVendors()
  const stores = getDarkStores()
  const stock = getStockRecords()
  const productCount = new Set(stock.map((s) => s.productId)).size
  const totalUnits = stock.reduce((sum, s) => sum + s.units, 0)

  function select(id: TabId) {
    setParams(id === 'vendors' ? {} : { tab: id }, { replace: true })
  }

  // WAI-ARIA tabs pattern: arrow keys / Home / End move between tabs.
  function handleKeyDown(e: KeyboardEvent) {
    const current = TABS.findIndex((t) => t.id === active)
    const targets: Record<string, number | undefined> = {
      ArrowRight: (current + 1) % TABS.length,
      ArrowLeft: (current - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }
    const next = targets[e.key]
    if (next === undefined) return
    e.preventDefault()
    select(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Global Picks inventory at Blinkit</h1>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">
        Brand-authorised importers own this stock and keep it in Blinkit dark stores, so trending imports reach shoppers
        in minutes, not weeks. See who holds each product, their import registration, and how many units are on the
        shelf.
      </p>
      <p className="mt-2 text-sm font-medium">
        {vendors.length} importers · {stores.length} dark stores in {stores[0]?.city} · {productCount} products ·{' '}
        {totalUnits} units
      </p>

      <div role="tablist" aria-label="Inventory view" className="mt-4 flex gap-1 border-b border-gray-200" onKeyDown={handleKeyDown}>
        {TABS.map((tab, i) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                selected ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="mt-4">
        {active === 'vendors' ? (
          <VendorTab vendors={vendors} stores={stores} stock={stock} />
        ) : (
          <DarkStoreTab stores={stores} stock={stock} />
        )}
      </div>
    </section>
  )
}
