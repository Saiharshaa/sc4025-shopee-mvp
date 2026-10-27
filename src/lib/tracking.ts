/**
 * Order tracking: shipments and live Blinkit delivery progress.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 *  1. An order splits into shipments: one per Blinkit dark store (items with
 *     darkStoreId) plus one "seller" shipment for everything else.
 *  2. A Blinkit shipment's progress is simulated from the clock: packing for
 *     the first PACKING_SHARE of the store's average delivery time, then on
 *     the way, then delivered. Prototype only: a live system would use the
 *     rider's location.
 */
import type { Order, OrderItem, OrderStatus } from '../types'

export const PACKING_SHARE = 0.2

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

export type QuickDeliveryStage = 'packing' | 'on-the-way' | 'delivered'

export interface QuickDeliveryProgress {
  stage: QuickDeliveryStage
  /** Whole minutes until the ETA, rounded up. 0 once delivered. */
  minutesLeft: number
  /** 0..1 share of the ETA that has passed. */
  fraction: number
}

/** Rule 2. Pass `now` explicitly in tests. */
export function quickDeliveryProgress(placedAt: string, etaMinutes: number, now: Date = new Date()): QuickDeliveryProgress {
  const elapsedMinutes = Math.max(0, (now.getTime() - Date.parse(placedAt)) / 60_000)
  const fraction = Math.min(1, elapsedMinutes / etaMinutes)
  const stage: QuickDeliveryStage = fraction >= 1 ? 'delivered' : fraction < PACKING_SHARE ? 'packing' : 'on-the-way'
  return { stage, minutesLeft: Math.max(0, Math.ceil(etaMinutes - elapsedMinutes)), fraction }
}
