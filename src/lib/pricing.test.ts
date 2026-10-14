import { describe, expect, it } from 'vitest'
import type { Cart, FixedVoucher, PercentageVoucher, Product, SpeedTier } from '../types'
import {
  DEFAULT_PRICING_RULES,
  applyCoins,
  calculateCoinCap,
  calculateOrderTotal,
  evaluateVoucher,
  isVoucherExpired,
} from './pricing'

// --- test helpers ----------------------------------------------------------

let nextId = 1
function product(price: number, speedTier: SpeedTier = 'standard'): Product {
  const id = `t${nextId++}`
  return {
    id,
    title: `Test product ${id}`,
    description: '',
    price,
    imageUrl: '',
    seller: 'Test seller',
    isImported: false,
    isVerified: true,
    speedTier,
    etaDays: 3,
    rating: 4,
    category: 'electronics',
  }
}

/** cartOf([price, qty], [price, qty], ...) */
function cartOf(...lines: [price: number, quantity: number][]): Cart {
  return { items: lines.map(([price, quantity]) => ({ product: product(price), quantity })) }
}

function pct(percentOff: number, maxDiscount: number, minSpend?: number): PercentageVoucher {
  return { code: `PCT${percentOff}`, title: '', type: 'percentage', percentOff, maxDiscount, minSpend, expiresAt: '2099-01-01T00:00:00Z' }
}

function fixed(amountOff: number, minSpend?: number): FixedVoucher {
  return { code: `FLAT${amountOff}`, title: '', type: 'fixed', amountOff, minSpend, expiresAt: '2099-01-01T00:00:00Z' }
}

const { shippingFee: FEE, freeShippingThreshold: THRESHOLD } = DEFAULT_PRICING_RULES

// --- subtotal --------------------------------------------------------------

describe('subtotal', () => {
  it('sums price x quantity across line items', () => {
    const b = calculateOrderTotal(cartOf([1299, 1], [199, 2], [219, 1]), null, 0)
    expect(b.lines.map((l) => l.lineTotal)).toEqual([1299, 398, 219])
    expect(b.subtotal).toBe(1916)
    expect(b.itemCount).toBe(4)
  })

  it('an empty cart costs nothing: no items, no shipping, no coins', () => {
    const b = calculateOrderTotal({ items: [] }, null, 100)
    expect(b.subtotal).toBe(0)
    expect(b.shipping.fee).toBe(0)
    expect(b.coins.applied).toBe(0)
    expect(b.total).toBe(0)
  })
})

// --- vouchers --------------------------------------------------------------

describe('vouchers', () => {
  it('no voucher means no discount and a null voucher breakdown', () => {
    const b = calculateOrderTotal(cartOf([600, 1]), null, 0)
    expect(b.voucher).toBeNull()
    expect(b.voucherDiscount).toBe(0)
    expect(b.postVoucherSubtotal).toBe(600)
  })

  it('percentage discount is rounded DOWN to the rupee', () => {
    // 15% of 333 = 49.95 -> 49
    const v = evaluateVoucher(pct(15, 1000), 333)
    expect(v.rawDiscount).toBe(49)
    expect(v.discount).toBe(49)
  })

  it('percentage discount is capped at maxDiscount', () => {
    // 15% of 2000 = 300 -> capped to 150
    const v = evaluateVoucher(pct(15, 150), 2000)
    expect(v.rawDiscount).toBe(300)
    expect(v.discount).toBe(150)
    expect(v.capped).toBe(true)
  })

  it('a discount exactly equal to the cap is not reported as capped', () => {
    // 15% of 1000 = 150 = maxDiscount
    const v = evaluateVoucher(pct(15, 150), 1000)
    expect(v.discount).toBe(150)
    expect(v.capped).toBe(false)
  })

  it('fixed voucher takes a flat amount off', () => {
    const b = calculateOrderTotal(cartOf([800, 1]), fixed(50), 0)
    expect(b.voucherDiscount).toBe(50)
    expect(b.postVoucherSubtotal).toBe(750)
  })

  it('min spend not met: voucher is ineligible, gives Rs 0, reports the shortfall', () => {
    const b = calculateOrderTotal(cartOf([900, 1]), pct(15, 150, 999), 0)
    expect(b.voucher).toMatchObject({ eligible: false, ineligibleReason: 'min-spend-not-met', shortfall: 99, discount: 0 })
    expect(b.voucherDiscount).toBe(0)
    expect(b.postVoucherSubtotal).toBe(900)
  })

  it('min spend is inclusive: subtotal exactly at min spend is eligible', () => {
    const v = evaluateVoucher(fixed(50, 299), 299)
    expect(v.eligible).toBe(true)
    expect(v.discount).toBe(50)
  })

  it('a voucher can never discount more than the subtotal', () => {
    const v = evaluateVoucher(fixed(500), 300)
    expect(v.rawDiscount).toBe(500)
    expect(v.discount).toBe(300)
  })
})

// --- shipping --------------------------------------------------------------

describe('shipping', () => {
  it(`charges the flat fee below the threshold (Rs ${THRESHOLD - 1})`, () => {
    const b = calculateOrderTotal(cartOf([THRESHOLD - 1, 1]), null, 0)
    expect(b.shipping).toMatchObject({ waived: false, fee: FEE, amountToFreeShipping: 1 })
    expect(b.total).toBe(THRESHOLD - 1 + FEE)
  })

  it(`is free at exactly the threshold (Rs ${THRESHOLD}): boundary is inclusive`, () => {
    const b = calculateOrderTotal(cartOf([THRESHOLD, 1]), null, 0)
    expect(b.shipping).toMatchObject({ waived: true, fee: 0, amountToFreeShipping: 0 })
    expect(b.total).toBe(THRESHOLD)
  })

  it('is judged on the POST-voucher subtotal: a voucher can push an order back under', () => {
    // 520 - 50 = 470 < 499 -> pays shipping
    const b = calculateOrderTotal(cartOf([520, 1]), fixed(50), 0)
    expect(b.postVoucherSubtotal).toBe(470)
    expect(b.shipping.fee).toBe(FEE)
    expect(b.shipping.amountToFreeShipping).toBe(29)
  })

  it('is judged BEFORE coins: coins cannot push an order back under', () => {
    // 500 >= 499 so free, even though 500 - 50 coins = 450
    const b = calculateOrderTotal(cartOf([500, 1]), null, 50)
    expect(b.coins.applied).toBe(50)
    expect(b.shipping.waived).toBe(true)
    expect(b.total).toBe(450)
  })

  it('speed tier does not change the fee', () => {
    const sameDay: Cart = { items: [{ product: product(200, 'same-day'), quantity: 1 }] }
    const express: Cart = { items: [{ product: product(200, 'express'), quantity: 1 }] }
    expect(calculateOrderTotal(sameDay, null, 0).shipping.fee).toBe(FEE)
    expect(calculateOrderTotal(express, null, 0).shipping.fee).toBe(FEE)
  })
})

// --- coins -----------------------------------------------------------------

describe('coins', () => {
  it('applies the full request when it is under the cap', () => {
    const c = applyCoins(30, 1000)
    expect(c).toEqual({ requested: 30, cap: 100, applied: 30, capped: false })
  })

  it('caps at 10% of the POST-voucher subtotal, not the original subtotal', () => {
    // 2000 - 200 = 1800 -> cap 180 (pre-voucher would have been 200)
    const b = calculateOrderTotal(cartOf([2000, 1]), fixed(200), 500)
    expect(b.coins).toEqual({ requested: 500, cap: 180, applied: 180, capped: true })
  })

  it('rounds the cap DOWN', () => {
    expect(calculateCoinCap(999)).toBe(99) // 99.9
    expect(calculateCoinCap(1005)).toBe(100) // 100.5
    expect(calculateCoinCap(9)).toBe(0) // 0.9
  })

  it('sanitises the request to a non-negative whole number of coins', () => {
    expect(applyCoins(12.9, 1000).applied).toBe(12)
    expect(applyCoins(-5, 1000).applied).toBe(0)
    expect(applyCoins(Number.NaN, 1000).applied).toBe(0)
    expect(applyCoins(Number.POSITIVE_INFINITY, 1000).applied).toBe(0)
  })

  it('respects a custom cap percentage', () => {
    expect(calculateCoinCap(1000, { ...DEFAULT_PRICING_RULES, coinCapPercent: 25 })).toBe(250)
  })
})

// --- order of operations ---------------------------------------------------

describe('calculateOrderTotal: order of operations', () => {
  it('subtotal -> voucher -> shipping -> coins, with every step in the breakdown', () => {
    // The seeded demo cart: 1299 + 2x199 + 219 = 1916
    const b = calculateOrderTotal(cartOf([1299, 1], [199, 2], [219, 1]), pct(15, 150, 999), 350)

    expect(b.subtotal).toBe(1916)
    expect(b.voucher).toMatchObject({ eligible: true, rawDiscount: 287, discount: 150, capped: true })
    expect(b.postVoucherSubtotal).toBe(1766)
    expect(b.shipping).toMatchObject({ waived: true, fee: 0 })
    expect(b.coins).toEqual({ requested: 350, cap: 176, applied: 176, capped: true })
    expect(b.total).toBe(1590)
  })

  it('total = post-voucher subtotal + shipping - coins', () => {
    // 300, no voucher -> 300 + 40 shipping; cap 30, use 10
    const b = calculateOrderTotal(cartOf([150, 2]), null, 10)
    expect(b.total).toBe(300 + FEE - 10)
  })
})

// --- zero floor ------------------------------------------------------------

describe('zero floor', () => {
  it('a voucher bigger than the cart zeroes the items; only shipping is left to pay', () => {
    const b = calculateOrderTotal(cartOf([300, 1]), fixed(500), 100)
    expect(b.postVoucherSubtotal).toBe(0)
    expect(b.coins.applied).toBe(0) // cap is 10% of 0
    expect(b.total).toBe(FEE)
  })

  it('total bottoms out at exactly 0 when shipping is also free', () => {
    const rules = { ...DEFAULT_PRICING_RULES, freeShippingThreshold: 0 }
    const b = calculateOrderTotal(cartOf([300, 1]), fixed(500), 100, rules)
    expect(b.total).toBe(0)
  })

  it('is never negative and always a whole number across a sweep of inputs', () => {
    const vouchers = [null, pct(15, 150), pct(90, 10_000), fixed(50), fixed(10_000), pct(15, 150, 999)]
    const coinRequests = [0, 1, 99, 10_000, -50, 3.7]
    for (const price of [0, 1, 9, 10, 333, 498, 499, 500, 999, 1916, 50_000]) {
      for (const voucher of vouchers) {
        for (const coins of coinRequests) {
          const { total } = calculateOrderTotal(cartOf([price, 1]), voucher, coins)
          expect(total).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(total)).toBe(true)
        }
      }
    }
  })
})

// --- expiry ----------------------------------------------------------------

describe('isVoucherExpired', () => {
  const v = { ...fixed(50), expiresAt: '2026-09-30T23:59:59+05:30' }

  it('is false before the expiry time', () => {
    expect(isVoucherExpired(v, new Date('2026-09-30T23:59:00+05:30'))).toBe(false)
  })

  it('is true after the expiry time', () => {
    expect(isVoucherExpired(v, new Date('2026-10-01T00:00:00+05:30'))).toBe(true)
  })
})
