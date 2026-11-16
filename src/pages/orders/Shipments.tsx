import { formatDate, formatDateTime } from '../../lib/format'
import { ORDER_STATUS_LABELS, QUICK_STAGE_LABELS, quickDeliveryProgress, type QuickDeliveryStage } from '../../lib/tracking'
import type { DarkStore, Order, OrderItem } from '../../types'
import OrderItems from './OrderItems'

/** OWNER: Person 4 (Tech Lead). One card per shipment on the tracking page. */

// US8: the four stages, in order.
const STAGES: QuickDeliveryStage[] = ['confirmed', 'packed', 'out-for-delivery', 'delivered']

const HEADLINES: Record<QuickDeliveryStage, string> = {
  confirmed: 'Order confirmed',
  packed: 'Packed at the store',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
}

interface BlinkitProps {
  order: Order
  store: DarkStore
  items: OrderItem[]
  now: Date
  /** Demo delay in minutes (0 = on time). */
  delayMinutes: number
}

export function BlinkitShipment({ order, store, items, now, delayMinutes }: BlinkitProps) {
  const progress = quickDeliveryProgress(order.placedAt, store.avgDeliveryMinutes, now, delayMinutes)
  const current = STAGES.indexOf(progress.stage)
  const headline =
    progress.stage === 'delivered'
      ? HEADLINES.delivered
      : `${HEADLINES[progress.stage]} · arriving in ~${progress.minutesLeft} min`

  return (
    <article aria-labelledby={`ship-${store.id}`} className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id={`ship-${store.id}`} className="text-sm font-semibold text-gray-600">
        ⚡ From {store.name}
      </h2>
      <p className="mt-1 text-lg font-bold" aria-live="polite">
        {headline}
      </p>
      {progress.delayed && (
        <p role="alert" className="mt-2 rounded bg-amber-50 p-2 text-sm text-amber-900">
          ⏱ Running about {delayMinutes} min late. Your rider is held up; the ETA above is updated.
        </p>
      )}
      <div
        role="progressbar"
        aria-label="Delivery progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.fraction * 100)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div className={`h-full rounded-full transition-all ${progress.delayed ? 'bg-amber-500' : 'bg-yellow-400'}`} style={{ width: `${progress.fraction * 100}%` }} />
      </div>
      <ol className="mt-2 flex justify-between gap-1 text-xs">
        {STAGES.map((s, i) => (
          <li key={s} className={i <= current ? 'font-semibold text-gray-900' : 'text-gray-400'}>
            {QUICK_STAGE_LABELS[s]}
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
