import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '../../context/useCart'
import { formatRupees } from '../../lib/format'
import { bestVoucher, calculateCashback, calculateOrderTotal, isVoucherExpired } from '../../lib/pricing'
import { getCoinBalance, getUser, getVouchers, placeOrder } from '../../mocks'
import type { PaymentMethod } from '../../types'
import PaymentMethodPicker from './PaymentMethodPicker'
import PriceBreakdown from './PriceBreakdown'
import VoucherPicker from './VoucherPicker'

/**
 * Route:  /checkout
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Checkout with voucher + coin stacking and the payment method
 *         (ShopeePay earns Coins back). The best voucher and Coins start
 *         applied (the report's "auto-applied, all-in price"); both can be undone. All money maths lives in
 *         src/lib/pricing.ts; this page only collects choices and displays
 *         the breakdown.
 */
export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [voucherCode, setVoucherCode] = useState<string | null>(
    () => bestVoucher(cart, getVouchers().filter((v) => !isVoucherExpired(v)))?.code ?? null,
  )
  const [useCoins, setUseCoins] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('shopeepay')
  const [error, setError] = useState<string | null>(null)

  if (cart.items.length === 0) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <Link to="/products" className="mt-4 inline-block text-brand underline">
          Browse products
        </Link>
      </section>
    )
  }

  const user = getUser()
  const address = user.defaultAddress
  const coinBalance = getCoinBalance()
  const vouchers = getVouchers().filter((v) => !isVoucherExpired(v))
  const voucher = vouchers.find((v) => v.code === voucherCode) ?? null
  const bestCode = bestVoucher(cart, vouchers)?.code ?? null

  // The engine caps coins; we only make sure we never ask for more than the user holds.
  const breakdown = calculateOrderTotal(cart, voucher, useCoins ? coinBalance : 0)
  const maxUsableCoins = Math.min(coinBalance, breakdown.coins.cap)
  const shopeePayCoins = calculateCashback(breakdown.total, 'shopeepay').coinsEarned
  const coinsEarned = calculateCashback(breakdown.total, paymentMethod).coinsEarned

  const total = formatRupees(breakdown.total)
  const payLabel =
    breakdown.total === 0
      ? 'Place order'
      : { shopeepay: `Pay ${total} with ShopeePay`, upi: `Pay ${total} by UPI`, cod: `Place order · pay ${total} on delivery` }[
          paymentMethod
        ]

  function handlePlaceOrder() {
    try {
      const order = placeOrder(cart, breakdown, address, paymentMethod)
      clearCart()
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place the order')
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Delivery address</h2>
            <address className="mt-1 text-sm not-italic text-gray-700">
              {address.recipient} · {address.phone}
              <br />
              {address.line1}
              {address.line2 && `, ${address.line2}`}
              <br />
              {address.city}, {address.state} {address.pincode}
            </address>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Items</h2>
            <ul className="mt-2 divide-y divide-gray-100 text-sm">
              {breakdown.lines.map((line) => (
                <li key={line.productId} className="flex gap-2 py-2">
                  <span className="min-w-0 flex-1 truncate">{line.title}</span>
                  <span className="flex-none text-gray-500">× {line.quantity}</span>
                  <span className="w-16 flex-none text-right">{formatRupees(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>

          <VoucherPicker
            vouchers={vouchers}
            subtotal={breakdown.subtotal}
            selectedCode={voucherCode}
            bestCode={bestCode}
            onSelect={setVoucherCode}
          />

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                checked={useCoins}
                disabled={maxUsableCoins === 0}
                onChange={(e) => setUseCoins(e.target.checked)}
              />
              <span className="flex-1">
                <span className="block font-semibold">Use Shopee Coins</span>
                <span className="block text-xs text-gray-500">
                  Balance {coinBalance} coins · up to {maxUsableCoins} usable on this order (1 coin = ₹1)
                </span>
              </span>
              <span className="text-sm font-medium text-brand">−{formatRupees(maxUsableCoins)}</span>
            </label>
          </div>

          <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} shopeePayCoins={shopeePayCoins} />
        </div>

        <aside className="h-fit rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-20">
          <PriceBreakdown breakdown={breakdown} />
          {coinsEarned > 0 ? (
            <p className="mt-3 rounded bg-brand-light p-2 text-sm text-brand-dark">
              You'll earn <strong>{coinsEarned} Shopee Coins</strong> with ShopeePay, worth {formatRupees(coinsEarned)} off
              a future order.
            </p>
          ) : (
            shopeePayCoins > 0 && (
              <p className="mt-3 text-xs text-gray-500">Paying with ShopeePay would earn {shopeePayCoins} Coins on this order.</p>
            )
          )}
          {error && (
            <p role="alert" className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handlePlaceOrder}
            className="mt-4 w-full rounded bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            {payLabel}
          </button>
        </aside>
      </div>
    </section>
  )
}
