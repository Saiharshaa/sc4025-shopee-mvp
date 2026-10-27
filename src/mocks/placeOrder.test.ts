import { describe, expect, it } from 'vitest'
import { calculateOrderTotal } from '../lib/pricing'
import type { Cart } from '../types'
import { getBlinkitAvailability, getCoinBalance, getOrders, getProductById, getUser, placeOrder } from './index'

// placeOrder changes in-memory state, so these tests run in order and build on each other.

function cartOf(...lines: [productId: string, quantity: number][]): Cart {
  return { items: lines.map(([id, quantity]) => ({ product: getProductById(id)!, quantity })) }
}

const address = getUser().defaultAddress

describe('placeOrder', () => {
  it('sends Global Picks from the nearby Blinkit store and takes them out of its stock', () => {
    const before = getBlinkitAvailability('p023')!
    const cart = cartOf(['p023', 2], ['p001', 1])

    const order = placeOrder(cart, calculateOrderTotal(cart, null, 0), address, 'upi')

    expect(order.items.find((i) => i.productId === 'p023')?.darkStoreId).toBe(before.store.id)
    expect(order.items.find((i) => i.productId === 'p001')?.darkStoreId).toBeUndefined() // seller ships it
    expect(getBlinkitAvailability('p023')!.units).toBe(before.units - 2)
  })

  it('credits ShopeePay cashback and deducts coins used', () => {
    const balance = getCoinBalance()
    const cart = cartOf(['p024', 1]) // 1199, cap 119 coins
    const breakdown = calculateOrderTotal(cart, null, 50)

    const order = placeOrder(cart, breakdown, address, 'shopeepay')

    // 1199 + 0 shipping - 50 coins = 1149 -> 5% = 57
    expect(order.pricing).toMatchObject({ total: 1149, coinsUsed: 50, coinsEarned: 57, paymentMethod: 'shopeepay' })
    expect(getCoinBalance()).toBe(balance - 50 + 57)
  })

  it('refuses more than the nearby store holds, and changes nothing', () => {
    const { units } = getBlinkitAvailability('p025')!
    const ordersBefore = getOrders().length
    const balance = getCoinBalance()
    const cart = cartOf(['p025', units + 1])

    expect(() => placeOrder(cart, calculateOrderTotal(cart, null, 10), address, 'shopeepay')).toThrow(/Only \d+ of .* left/)
    expect(getBlinkitAvailability('p025')!.units).toBe(units)
    expect(getOrders()).toHaveLength(ordersBefore)
    expect(getCoinBalance()).toBe(balance)
  })

  it('numbers new orders after the fixtures', () => {
    expect(getOrders().map((o) => o.id)).toEqual(expect.arrayContaining(['ORD-1004', 'ORD-1005']))
  })
})
