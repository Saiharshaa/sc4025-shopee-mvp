/**
 * Order tracking: shipments and live Blinkit delivery progress.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 *  1. An order splits into shipments: one per Blinkit dark store (items with
 *     darkStoreId) plus one "seller" shipment for everything else.
 *  2. A Blinkit shipment's progress is simulated from the clock and the
 *     store's average delivery time (US8 stages): Confirmed for the first
 *     PACKED_AT of it, Packed until OUT_AT, then Out for delivery until the
 *     ETA, then Delivered. Prototype only: a live system would use the rider.
 *  3. A delay (demo switch) adds minutes to the ETA. It only stretches "Out
 *     for delivery", so a stage never goes backwards.
 *  4. An order is delivered when every Blinkit shipment is, and its seller
 *     items (if any) are too (order.status). Coins are credited then (US9).
 */
import type { DarkStore, Order, OrderItem, OrderStatus } from '../types'

export const PACKED_AT = 0.1
export const OUT_AT = 0.25

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export type Shipment = { kind: 'blinkit'; darkStoreId: string; items: OrderItem[] } | { kind: 'seller'; items: OrderItem[] }

/** Rule 1. Blinkit shipments first, in the order their stores first appear. */
export function splitShipments(order: Order): Shipment[] {
  const blinkit = new Map<string, OrderItem[]>()
  const seller: OrderItem[] = []
  for (const item of order.items) {
    if (item.darkStoreId) blinkit.set(item.darkStoreId, [...(blinkit.get(item.darkStoreId) ?? []), item])
    else seller.push(item)
  }
  return [
    ...[...blinkit].map(([darkStoreId, items]): Shipment => ({ kind: 'blinkit', darkStoreId, items })),
    ...(seller.length > 0 ? [{ kind: 'seller', items: seller } satisfies Shipment] : []),
  ]
}

export type QuickDeliveryStage = 'confirmed' | 'packed' | 'out-for-delivery' | 'delivered'

export const QUICK_STAGE_LABELS: Record<QuickDeliveryStage, string> = {
  confirmed: 'Confirmed',
  packed: 'Packed',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
}

export interface QuickDeliveryProgress {
  stage: QuickDeliveryStage
  /** Whole minutes until the (possibly delayed) ETA, rounded up. 0 once delivered. */
  minutesLeft: number
  /** 0..1 share of the (possibly delayed) ETA that has passed. */
  fraction: number
  /** True while a delay is pushing the ETA back. */
  delayed: boolean
}

/** Rules 2 and 3. Pass `now` explicitly in tests. */
export function quickDeliveryProgress(
  placedAt: string,
  etaMinutes: number,
  now: Date = new Date(),
  delayMinutes = 0,
): QuickDeliveryProgress {
  const elapsed = Math.max(0, (now.getTime() - Date.parse(placedAt)) / 60_000)
  const total = etaMinutes + Math.max(0, delayMinutes)
  const stage: QuickDeliveryStage =
    elapsed >= total ? 'delivered' : elapsed < etaMinutes * PACKED_AT ? 'confirmed' : elapsed < etaMinutes * OUT_AT ? 'packed' : 'out-for-delivery'
  return {
    stage,
    minutesLeft: Math.max(0, Math.ceil(total - elapsed)),
    fraction: Math.min(1, elapsed / total),
    delayed: delayMinutes > 0 && stage !== 'delivered',
  }
}

/** Rule 4. */
export function isOrderDelivered(order: Order, stores: DarkStore[], now: Date = new Date(), delayMinutes = 0): boolean {
  return splitShipments(order).every((s) => {
    if (s.kind === 'seller') return order.status === 'delivered'
    const store = stores.find((st) => st.id === s.darkStoreId)
    return store !== undefined && quickDeliveryProgress(order.placedAt, store.avgDeliveryMinutes, now, delayMinutes).stage === 'delivered'
  })
}
