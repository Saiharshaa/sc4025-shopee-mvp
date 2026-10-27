import { formatDate, formatDateTime } from '../../lib/format'
import { ORDER_STATUS_LABELS, quickDeliveryProgress, type QuickDeliveryStage } from '../../lib/tracking'
import type { DarkStore, Order, OrderItem } from '../../types'
import OrderItems from './OrderItems'

/** OWNER: Person 4 (Tech Lead). One card per shipment on the tracking page. */

const STAGES: { id: QuickDeliveryStage; label: string }[] = [
  { id: 'packing', label: 'Packing' },
  { id: 'on-the-way', label: 'On the way' },
  { id: 'delivered', label: 'Delivered' },
]

export function BlinkitShipment({ order, store, items, now }: { order: Order; store: DarkStore; items: OrderItem[]; now: Date }) {
  const progress = quickDeliveryProgress(order.placedAt, store.avgDeliveryMinutes, now)
  const current = STAGES.findIndex((s) => s.id === progress.stage)
  const headline =
    progress.stage === 'delivered'
      ? 'Delivered'
      : `${progress.stage === 'packing' ? 'Packing your order' : 'On the way'} · arriving in ~${progress.minutesLeft} min`

  return (
    <article aria-labelledby={`ship-${store.id}`} className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id={`ship-${store.id}`} className="text-sm font-semibold text-gray-600">
        ⚡ From {store.name}
      </h2>
      <p className="mt-1 text-lg font-bold" aria-live="polite">
        {headline}
      </p>
      <div
        role="progressbar"
        aria-label="Delivery progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.fraction * 100)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${progress.fraction * 100}%` }} />
      </div>
      <ol className="mt-2 flex justify-between text-xs">
        {STAGES.map((s, i) => (
          <li key={s.id} className={i <= current ? 'font-semibold text-gray-900' : 'text-gray-400'}>
            {s.label}
          </li>
        ))}
      </ol>
      <OrderItems items={items} />
    </article>
  )
}

export function SellerShipment({ order, items }: { order: Order; items: OrderItem[] }) {
  const events = [...order.timeline].reverse()
  return (
    <article aria-labelledby="ship-seller" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="ship-seller" className="text-sm font-semibold text-gray-600">
        From sellers
      </h2>
      <p className="mt-1 text-lg font-bold">
        {ORDER_STATUS_LABELS[order.status]}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <span className="text-base font-normal text-gray-600"> · expected by {formatDate(order.estimatedDelivery)}</span>
        )}
      </p>
      <ol className="mt-3 space-y-3 border-l-2 border-gray-200 pl-4 text-sm">
        {events.map((e, i) => (
          <li key={`${e.status}-${e.at}`} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full ${i === 0 ? 'bg-brand' : 'bg-gray-300'}`}
            />
            <p className={i === 0 ? 'font-semibold' : 'text-gray-600'}>{ORDER_STATUS_LABELS[e.status]}</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(e.at)}
              {e.note && ` · ${e.note}`}
            </p>
          </li>
        ))}
      </ol>
      <OrderItems items={items} />
    </article>
  )
}
