import { describe, expect, it } from 'vitest'
import type { Order, OrderItem } from '../types'
import { isOrderDelivered, quickDeliveryProgress, splitShipments } from './tracking'

const item = (productId: string, darkStoreId?: string): OrderItem => ({
  productId,
  title: productId,
  imageUrl: '',
  unitPrice: 100,
  quantity: 1,
  speedTier: 'same-day',
  ...(darkStoreId && { darkStoreId }),
})

const orderOf = (items: OrderItem[]) => ({ items }) as Order

describe('splitShipments', () => {
  it('groups Blinkit items by dark store, then everything else as one seller shipment', () => {
    const shipments = splitShipments(orderOf([item('a'), item('b', 'ds-hsr'), item('c', 'ds-kor'), item('d', 'ds-hsr')]))
    expect(shipments.map((s) => [s.kind, s.kind === 'blinkit' ? s.darkStoreId : '-', s.items.map((i) => i.productId).join('')])).toEqual([
      ['blinkit', 'ds-hsr', 'bd'],
      ['blinkit', 'ds-kor', 'c'],
      ['seller', '-', 'a'],
    ])
  })

  it('has no seller shipment when everything comes from Blinkit, and vice versa', () => {
    expect(splitShipments(orderOf([item('a', 'ds-hsr')])).map((s) => s.kind)).toEqual(['blinkit'])
    expect(splitShipments(orderOf([item('a')])).map((s) => s.kind)).toEqual(['seller'])
  })
})

describe('quickDeliveryProgress', () => {
  const placedAt = '2026-10-27T12:00:00+05:30'
  const at = (minutes: number) => new Date(Date.parse(placedAt) + minutes * 60_000)

  it('goes Confirmed -> Packed -> Out for delivery -> Delivered (US8)', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(0))).toEqual({ stage: 'confirmed', minutesLeft: 10, fraction: 0, delayed: false })
    expect(quickDeliveryProgress(placedAt, 10, at(1)).stage).toBe('packed')
    expect(quickDeliveryProgress(placedAt, 10, at(2.5))).toMatchObject({ stage: 'out-for-delivery', minutesLeft: 8 })
    expect(quickDeliveryProgress(placedAt, 10, at(9.5))).toMatchObject({ stage: 'out-for-delivery', minutesLeft: 1 })
    expect(quickDeliveryProgress(placedAt, 10, at(10))).toEqual({ stage: 'delivered', minutesLeft: 0, fraction: 1, delayed: false })
  })

  it('a delay pushes the ETA back without moving the stage backwards', () => {
    const late = quickDeliveryProgress(placedAt, 10, at(9), 10)
    expect(late).toMatchObject({ stage: 'out-for-delivery', minutesLeft: 11, delayed: true })
    expect(quickDeliveryProgress(placedAt, 10, at(3), 10).stage).toBe('out-for-delivery')
    expect(quickDeliveryProgress(placedAt, 10, at(20), 10)).toMatchObject({ stage: 'delivered', delayed: false })
  })

  it('never passes 100%, and treats a clock behind the order time as just placed', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(60)).fraction).toBe(1)
    expect(quickDeliveryProgress(placedAt, 10, at(-1))).toMatchObject({ stage: 'confirmed', minutesLeft: 10 })
  })
})

describe('isOrderDelivered', () => {
  const store = { id: 'ds-hsr', name: '', area: '', city: '', avgDeliveryMinutes: 10, pincodes: [] }
  const placedAt = '2026-10-27T12:00:00+05:30'
  const at = (minutes: number) => new Date(Date.parse(placedAt) + minutes * 60_000)
  const order = (items: OrderItem[], status: Order['status'] = 'placed') => ({ items, placedAt, status }) as Order

  it('needs every Blinkit shipment delivered, and the seller part too', () => {
    expect(isOrderDelivered(order([item('a', 'ds-hsr')]), [store], at(9))).toBe(false)
    expect(isOrderDelivered(order([item('a', 'ds-hsr')]), [store], at(10))).toBe(true)
    expect(isOrderDelivered(order([item('a', 'ds-hsr')]), [store], at(10), 5)).toBe(false)
    expect(isOrderDelivered(order([item('a', 'ds-hsr'), item('b')]), [store], at(60))).toBe(false)
    expect(isOrderDelivered(order([item('b')], 'delivered'), [store], at(0))).toBe(true)
  })
})
