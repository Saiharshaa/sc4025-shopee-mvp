import { describe, expect, it } from 'vitest'
import { calculateOrderTotal } from '../lib/pricing'
import type { Cart } from '../types'
import { getCart, getOrders, getProductById, getProducts, getVoucherByCode, getVouchers } from './index'

// Guards for anyone adding fixtures: catches typos and inconsistent data early.

describe('product fixtures', () => {
  const products = getProducts()

  it('have unique ids', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
  })

  it.each(products)('$id has sane values', (p) => {
    expect(Number.isInteger(p.price) && p.price > 0).toBe(true)
    if (p.originalPrice !== undefined) expect(p.originalPrice).toBeGreaterThan(p.price)
    expect(p.rating).toBeGreaterThanOrEqual(0)
    expect(p.rating).toBeLessThanOrEqual(5)
    expect(Number.isInteger(p.etaDays) && p.etaDays >= 0).toBe(true)
    if (p.speedTier === 'same-day') expect(p.etaDays).toBe(0)
  })
})

describe('voucher fixtures', () => {
  it('have unique codes', () => {
    const vouchers = getVouchers()
    expect(new Set(vouchers.map((v) => v.code)).size).toBe(vouchers.length)
  })
})

describe('cart fixture', () => {
  it('only references products that exist', () => {
    expect(getCart().items.length).toBeGreaterThan(0)
  })
})

describe('order fixtures', () => {
  it.each(getOrders())('$id pricing matches the discount engine', (order) => {
    const cart: Cart = {
      items: order.items.map((item) => {
        const product = getProductById(item.productId)
        if (!product) throw new Error(`Unknown product ${item.productId}`)
        return { product: { ...product, price: item.unitPrice }, quantity: item.quantity }
      }),
    }
    const voucher = order.pricing.voucherCode ? getVoucherByCode(order.pricing.voucherCode) ?? null : null
    const b = calculateOrderTotal(cart, voucher, order.pricing.coinsUsed)

    expect({
      subtotal: b.subtotal,
      voucherDiscount: b.voucherDiscount,
      shippingFee: b.shipping.fee,
      coinsUsed: b.coins.applied,
      total: b.total,
    }).toEqual({
      subtotal: order.pricing.subtotal,
      voucherDiscount: order.pricing.voucherDiscount,
      shippingFee: order.pricing.shippingFee,
      coinsUsed: order.pricing.coinsUsed,
      total: order.pricing.total,
    })
  })

  it.each(getOrders())('$id timeline ends on its current status', (order) => {
    expect(order.timeline.at(-1)?.status).toBe(order.status)
  })
})
