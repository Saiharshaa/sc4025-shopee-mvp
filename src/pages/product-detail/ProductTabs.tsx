import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { formatDateTime } from '../../lib/format'
import type { BlinkitAvailability, Product, Vendor } from '../../types'

/**
 * OWNER: Person 4 (Tech Lead). "Details" and "Seller & stock" tabs (US3):
 * the seller of record, the Blinkit store that would dispatch it, the real
 * unit count there and the last restock. Marketplace products say plainly
 * that they ship from the seller instead.
 */

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'stock', label: 'Seller & stock' },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  product: Product
  vendor?: Vendor
  availability?: BlinkitAvailability
}

export default function ProductTabs({ product, vendor, availability }: Props) {
  const [active, setActive] = useState<TabId>('details')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  // WAI-ARIA tabs: arrow keys move between tabs.
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (TABS.findIndex((t) => t.id === active) + 1) % TABS.length
    setActive(TABS[next].id)
    refs.current[next]?.focus()
  }

  return (
    <section className="mt-4 rounded-lg bg-white shadow-sm">
      <div role="tablist" aria-label="Product information" className="flex border-b border-gray-200 px-2" onKeyDown={handleKeyDown}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`ptab-${tab.id}`}
            aria-controls={`ppanel-${tab.id}`}
            aria-selected={active === tab.id}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
              active === tab.id ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`ppanel-${active}`} aria-labelledby={`ptab-${active}`} className="p-4 text-sm">
        {active === 'details' ? (
          <p className="text-gray-700">{product.description}</p>
        ) : vendor && availability ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Item label="Seller of record">
              {vendor.legalName}
              <span className="block text-xs text-gray-500">Brand-authorised importer</span>
            </Item>
            <Item label="Dispatching store">
              {availability.store.name}
              <span className="block text-xs text-gray-500">~{availability.store.avgDeliveryMinutes} min to your address</span>
            </Item>
            <Item label="Units in stock">
              {availability.units === 0 ? (
                <span className="font-semibold text-red-700">0 · out of stock</span>
              ) : (
                <span className="font-semibold">{availability.units}</span>
              )}
              <span className="block text-xs text-gray-500">Live count at this store, not an estimate</span>
            </Item>
            <Item label="Last restocked">{formatDateTime(availability.lastRestockedAt)}</Item>
          </dl>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Item label="Seller">{product.seller}</Item>
            <Item label="Ships from">
              {product.isImported ? "The seller's overseas warehouse" : "The seller's warehouse"}
              <span className="block text-xs text-gray-500">Not stocked at a Blinkit store</span>
            </Item>
          </dl>
        )}
      </div>
    </section>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
