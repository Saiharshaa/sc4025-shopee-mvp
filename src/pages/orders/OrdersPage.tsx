import { Link } from 'react-router'
import { formatDateTime, formatRupees } from '../../lib/format'
import { ORDER_STATUS_LABELS, quickDeliveryProgress, splitShipments } from '../../lib/tracking'
import { getDarkStores, getOrders } from '../../mocks'
import type { Order } from '../../types'
import { useNow } from './useNow'

/**
 * Route:  /orders
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Every order, newest first, each linking to its tracking page.
 */

const QUICK_LABELS = { packing: 'Packing', 'on-the-way': 'On the way', delivered: 'Delivered' }

export default function OrdersPage() {
  const now = useNow(15_000)
  const orders = getOrders()
  const stores = getDarkStores()

  // All-Blinkit orders follow the live simulation; anything with seller items shows the order status.
  function statusLabel(order: Order): string {
    const [only, ...others] = splitShipments(order)
    const store = others.length === 0 && only?.kind === 'blinkit' ? stores.find((s) => s.id === only.darkStoreId) : undefined
    return store ? QUICK_LABELS[quickDeliveryProgress(order.placedAt, store.avgDeliveryMinutes, now).stage] : ORDER_STATUS_LABELS[order.status]
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No orders yet.{' '}
          <Link to="/products" className="text-brand underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => {
            const [first, ...rest] = order.items
            const quick = order.items.some((i) => i.darkStoreId)
            return (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="block rounded-lg bg-white p-4 shadow-sm hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {order.id}
                      <span className="ml-2 text-sm font-normal text-gray-500">{formatDateTime(order.placedAt)}</span>
                    </p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{statusLabel(order)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-700">
                    {first.title}
                    {rest.length > 0 && <span className="text-gray-500"> + {rest.length} more</span>}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm">
                    <span className="font-semibold text-brand">{formatRupees(order.pricing.total)}</span>
                    {quick && <span className="rounded bg-yellow-300 px-1.5 text-xs font-semibold">⚡ Blinkit</span>}
                    {order.pricing.coinsEarned > 0 && <span className="text-xs text-brand">+{order.pricing.coinsEarned} Coins</span>}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
