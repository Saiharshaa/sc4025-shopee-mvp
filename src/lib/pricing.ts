/**
 * Discount engine: voucher + Shopee Coins stacking.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 * Rules (agreed by the team 2026-10-14; change them here AND in the tests):
 *  1. Subtotal = sum of price x quantity. All money is whole rupees.
 *  2. At most ONE voucher per order (the API only accepts one).
 *  3. A voucher is eligible when subtotal >= minSpend (inclusive). An
 *     ineligible voucher gives Rs 0 and is reported in the breakdown; it
 *     does not throw.
 *  4. Percentage voucher: floor(subtotal x percentOff / 100), capped at
 *     maxDiscount. Fixed voucher: amountOff. Either kind is clamped so it can
 *     never exceed the subtotal.
 *  5. Shipping: one flat fee per order, waived when the post-voucher,
 *     pre-coin subtotal >= freeShippingThreshold (inclusive). Speed tier does
 *     not change the fee. An empty cart has nothing to ship, so no fee.
 *  6. Coins: 1 coin = Rs 1, at most floor(coinCapPercent% of the post-voucher
 *     subtotal). The request is floored to whole coins and clamped to
 *     [0, cap]. The engine does not know the user's balance; callers pass
 *     min(balance, coinsWanted).
 *  7. Order of operations: subtotal -> voucher -> shipping -> coins.
 *  8. Payable total = post-voucher subtotal + shipping - coins, never < 0.
 *  9. Cashback (proposed 2026-10-27 after the 22 Oct meeting): paying with
 *     ShopeePay earns floor(shopeePayCashbackPercent% of the payable total)
 *     Coins, at most maxCashbackCoins per order. Other methods earn none.
 *     It is based on what the shopper actually pays, so coins spent never
 *     earn coins, and it never changes the total. See calculateCashback.
 *
 * Percentages are whole numbers (15, not 0.15) so every calculation stays in
 * integer arithmetic before the final floor. 0.1 * x style maths can land on
 * 6.9999... and floor to the wrong rupee.
 */
import type {
  CashbackBreakdown,
  Cart,
  CoinsBreakdown,
  LineItemBreakdown,
  OrderBreakdown,
  PaymentMethod,
  PricingRules,
  ShippingBreakdown,
  Voucher,
  VoucherBreakdown,
} from '../types'

export const DEFAULT_PRICING_RULES: PricingRules = {
  freeShippingThreshold: 499,
  shippingFee: 40,
  coinCapPercent: 10,
  shopeePayCashbackPercent: 5,
  maxCashbackCoins: 100,
}

export function calculateLineItems(cart: Cart): LineItemBreakdown[] {
  return cart.items.map(({ product, quantity }) => ({
    productId: product.id,
    title: product.title,
    unitPrice: product.price,
    quantity,
    lineTotal: product.price * quantity,
  }))
}

/** Rule 3 + 4. Also useful on its own to show which vouchers a cart qualifies for. */
export function evaluateVoucher(voucher: Voucher, subtotal: number): VoucherBreakdown {
  const minSpend = voucher.minSpend ?? 0

  if (subtotal < minSpend) {
    return {
      code: voucher.code,
      type: voucher.type,
      eligible: false,
      ineligibleReason: 'min-spend-not-met',
      shortfall: minSpend - subtotal,
      rawDiscount: 0,
      discount: 0,
      capped: false,
    }
  }

  let rawDiscount: number
  let afterCap: number
  if (voucher.type === 'percentage') {
    rawDiscount = Math.floor((subtotal * voucher.percentOff) / 100)
    afterCap = Math.min(rawDiscount, voucher.maxDiscount)
  } else {
    rawDiscount = voucher.amountOff
    afterCap = rawDiscount
  }

  return {
    code: voucher.code,
    type: voucher.type,
    eligible: true,
    shortfall: 0,
    rawDiscount,
    discount: Math.min(afterCap, subtotal),
    capped: afterCap < rawDiscount,
  }
}

/** Rule 5. `postVoucherSubtotal` is before coins. */
export function calculateShipping(
  postVoucherSubtotal: number,
  hasItems: boolean,
  rules: PricingRules = DEFAULT_PRICING_RULES,
): ShippingBreakdown {
  const waived = postVoucherSubtotal >= rules.freeShippingThreshold
  return {
    baseFee: rules.shippingFee,
    threshold: rules.freeShippingThreshold,
    waived,
    fee: hasItems && !waived ? rules.shippingFee : 0,
    amountToFreeShipping: waived ? 0 : rules.freeShippingThreshold - postVoucherSubtotal,
  }
}

/** Rule 6: the most coins this order can take. */
export function calculateCoinCap(postVoucherSubtotal: number, rules: PricingRules = DEFAULT_PRICING_RULES): number {
  return Math.floor((postVoucherSubtotal * rules.coinCapPercent) / 100)
}

/** Rule 6. */
export function applyCoins(
  coinsToApply: number,
  postVoucherSubtotal: number,
  rules: PricingRules = DEFAULT_PRICING_RULES,
): CoinsBreakdown {
  const requested = Number.isFinite(coinsToApply) ? Math.max(0, Math.floor(coinsToApply)) : 0
  const cap = calculateCoinCap(postVoucherSubtotal, rules)
  return { requested, cap, applied: Math.min(requested, cap), capped: requested > cap }
}

/**
 * The single entry point for the UI. Returns every intermediate step so the
 * page can show exactly how the discount was built up.
 */
export function calculateOrderTotal(
  cart: Cart,
  voucher: Voucher | null,
  coinsToApply: number,
  rules: PricingRules = DEFAULT_PRICING_RULES,
): OrderBreakdown {
  // 1. Subtotal
  const lines = calculateLineItems(cart)
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  // 2. Voucher
  const voucherResult = voucher ? evaluateVoucher(voucher, subtotal) : null
  const voucherDiscount = voucherResult?.discount ?? 0
  const postVoucherSubtotal = subtotal - voucherDiscount

  // 3. Shipping (on post-voucher, pre-coin subtotal)
  const shipping = calculateShipping(postVoucherSubtotal, lines.length > 0, rules)

  // 4. Coins (capped on post-voucher subtotal)
  const coins = applyCoins(coinsToApply, postVoucherSubtotal, rules)

  // 5. Total, floored at zero
  const total = Math.max(0, postVoucherSubtotal + shipping.fee - coins.applied)

  return {
    lines,
    itemCount,
    subtotal,
    voucher: voucherResult,
    voucherDiscount,
    postVoucherSubtotal,
    shipping,
    coins,
    total,
  }
}

/**
 * The voucher that makes this cart cheapest, comparing totals BEFORE coins so
 * spending coins never decides it. Accounts for shipping: a voucher that drops
 * the cart below the free-shipping threshold can lose. Ties keep the earlier
 * voucher. null when no voucher beats using none. Pass unexpired vouchers.
 */
export function bestVoucher(cart: Cart, vouchers: Voucher[], rules: PricingRules = DEFAULT_PRICING_RULES): Voucher | null {
  let best: Voucher | null = null
  let bestTotal = calculateOrderTotal(cart, null, 0, rules).total
  for (const voucher of vouchers) {
    const { total, voucher: result } = calculateOrderTotal(cart, voucher, 0, rules)
    if (result?.eligible && total < bestTotal) {
      best = voucher
      bestTotal = total
    }
  }
  return best
}

/** Rule 9. Pass the breakdown's `total`: cashback is on what is actually paid. */
export function calculateCashback(
  total: number,
  method: PaymentMethod,
  rules: PricingRules = DEFAULT_PRICING_RULES,
): CashbackBreakdown {
  const percent = method === 'shopeepay' ? rules.shopeePayCashbackPercent : 0
  const rawCoins = Math.floor((Math.max(0, total) * percent) / 100)
  const coinsEarned = Math.min(rawCoins, rules.maxCashbackCoins)
  return { method, percent, coinsEarned, capped: coinsEarned < rawCoins }
}

/** True once the voucher's expiry time has passed. Pass `now` explicitly in tests. */
export function isVoucherExpired(voucher: Voucher, now: Date = new Date()): boolean {
  return Date.parse(voucher.expiresAt) < now.getTime()
}
