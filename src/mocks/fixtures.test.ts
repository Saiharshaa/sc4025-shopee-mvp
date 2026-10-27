import { describe, expect, it } from 'vitest'
import { calculateCashback, calculateOrderTotal } from '../lib/pricing'
import type { Cart } from '../types'
import {
  getCart,
  getDarkStores,
  getOrders,
  getProductById,
  getProducts,
  getStockRecords,
  getVendorById,
  getVendors,
  getVoucherByCode,
  getVouchers,
} from './index'

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

describe('inventory fixtures', () => {
  const stock = getStockRecords()
  const storeIds = new Set(getDarkStores().map((s) => s.id))

  it('have unique vendor and dark store ids', () => {
    expect(new Set(getVendors().map((v) => v.id)).size).toBe(getVendors().length)
    expect(storeIds.size).toBe(getDarkStores().length)
  })

  it('have at most one stock line per product per dark store', () => {
    const keys = stock.map((s) => `${s.productId}@${s.darkStoreId}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it.each(stock)('$productId @ $darkStoreId is consistent', (s) => {
    const product = getProductById(s.productId)
    const vendor = getVendorById(s.vendorId)
    expect(product).toBeDefined()
    expect(vendor).toBeDefined()
    expect(storeIds.has(s.darkStoreId)).toBe(true)
    expect(Number.isInteger(s.units) && s.units >= 0).toBe(true)

    // Global Picks promise: verified imports, sold by an importer the brand authorised, delivered same day.
    expect(product!.seller).toBe(vendor!.name)
    expect(product!.isImported && product!.isVerified).toBe(true)
    expect(product!.speedTier).toBe('same-day')
    expect(vendor!.authorisedBrands.some((brand) => product!.title.startsWith(`${brand} `))).toBe(true)
  })

  it('each product is held by exactly one vendor', () => {
    const vendorsByProduct = new Map<string, Set<string>>()
    for (const s of stock) {
      vendorsByProduct.set(s.productId, (vendorsByProduct.get(s.productId) ?? new Set()).add(s.vendorId))
    }
    for (const vendors of vendorsByProduct.values()) expect(vendors.size).toBe(1)
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
      coinsEarned: calculateCashback(b.total, order.pricing.paymentMethod).coinsEarned,
    }).toEqual({
      subtotal: order.pricing.subtotal,
      voucherDiscount: order.pricing.voucherDiscount,
      shippingFee: order.pricing.shippingFee,
      coinsUsed: order.pricing.coinsUsed,
      total: order.pricing.total,
      coinsEarned: order.pricing.coinsEarned,
    })
  })

  it.each(getOrders())('$id timeline ends on its current status', (order) => {
    expect(order.timeline.at(-1)?.status).toBe(order.status)
  })
})
