import { describe, expect, it } from 'vitest'
import type { Order, OrderItem } from '../types'
import { quickDeliveryProgress, splitShipments } from './tracking'

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

  it('is packing for the first 20% of the ETA', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(0))).toEqual({ stage: 'packing', minutesLeft: 10, fraction: 0 })
    expect(quickDeliveryProgress(placedAt, 10, at(1.9)).stage).toBe('packing')
  })

  it('is on the way from 20% until the ETA, counting minutes down (rounded up)', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(2))).toMatchObject({ stage: 'on-the-way', minutesLeft: 8 })
    expect(quickDeliveryProgress(placedAt, 10, at(9.5))).toMatchObject({ stage: 'on-the-way', minutesLeft: 1 })
  })

  it('is delivered at and after the ETA, never past 100%', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(10))).toEqual({ stage: 'delivered', minutesLeft: 0, fraction: 1 })
    expect(quickDeliveryProgress(placedAt, 10, at(60)).fraction).toBe(1)
  })

  it('treats a clock slightly behind the order time as just placed', () => {
    expect(quickDeliveryProgress(placedAt, 10, at(-1))).toEqual({ stage: 'packing', minutesLeft: 10, fraction: 0 })
  })
})
