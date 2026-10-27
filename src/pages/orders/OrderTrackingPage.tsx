import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { PAYMENT_METHOD_LABELS, formatDateTime, formatRupees } from '../../lib/format'
import { splitShipments } from '../../lib/tracking'
import { getDarkStores, getOrderById } from '../../mocks'
import { BlinkitShipment, SellerShipment } from './Shipments'
import { useNow } from './useNow'

/**
 * Route:  /orders/:id
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Order tracking: the "Receive" stage. Global Picks show a live ETA
 *         from the Blinkit store (updates every 15 s); seller items show the
 *         event timeline. Checkout arrives here with state { justPlaced }.
 *         Shipment and progress rules live in src/lib/tracking.ts.
 */
export default function OrderTrackingPage() {
  const { id = '' } = useParams()
  const { state } = useLocation()
  const now = useNow(15_000)
  const order = getOrderById(id)

  if (!order) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link to="/orders" className="mt-4 inline-block text-brand underline">
          See all orders
        </Link>
      </section>
    )
  }

  const justPlaced = (state as { justPlaced?: boolean } | null)?.justPlaced === true
  const stores = getDarkStores()
  const { pricing, shippingAddress: address } = order

  return (
    <section>
      {justPlaced && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <strong>Order placed.</strong>
          {pricing.coinsEarned > 0 && (
            <>
              {' '}
              {pricing.coinsEarned} Shopee Coins are in your{' '}
              <Link to="/wallet" className="underline">
                wallet
              </Link>{' '}
              for next time.
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Order {order.id}</h1>
        <Link to="/orders" className="text-sm font-medium text-brand hover:underline">
          All orders
        </Link>
      </div>
      <p className="text-sm text-gray-500">Placed {formatDateTime(order.placedAt)}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          {splitShipments(order).map((shipment) => {
            if (shipment.kind === 'seller') return <SellerShipment key="seller" order={order} items={shipment.items} />
            const store = stores.find((s) => s.id === shipment.darkStoreId)
            return store ? (
              <BlinkitShipment key={store.id} order={order} store={store} items={shipment.items} now={now} />
            ) : null
          })}
        </div>

        <aside className="h-fit space-y-4 rounded-lg bg-white p-4 text-sm shadow-sm">
          <div>
            <h2 className="font-semibold">Delivery address</h2>
            <address className="mt-1 not-italic text-gray-700">
              {address.recipient} · {address.phone}
              <br />
              {address.line1}
              {address.line2 && `, ${address.line2}`}
              <br />
              {address.city}, {address.state} {address.pincode}
            </address>
          </div>

          <div>
            <h2 className="font-semibold">Payment · {PAYMENT_METHOD_LABELS[pricing.paymentMethod]}</h2>
            <dl className="mt-1 space-y-1">
              <Line label="Merchandise subtotal">{formatRupees(pricing.subtotal)}</Line>
              {pricing.voucherCode && <Line label={`Voucher ${pricing.voucherCode}`}>−{formatRupees(pricing.voucherDiscount)}</Line>}
              <Line label="Shipping fee">{pricing.shippingFee === 0 ? 'Free' : formatRupees(pricing.shippingFee)}</Line>
              {pricing.coinsUsed > 0 && <Line label={`Shopee Coins (${pricing.coinsUsed})`}>−{formatRupees(pricing.coinsUsed)}</Line>}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
                <dt>Total</dt>
                <dd className="text-brand">{formatRupees(pricing.total)}</dd>
              </div>
            </dl>
            {pricing.coinsEarned > 0 && (
              <p className="mt-2 rounded bg-brand-light p-2 text-brand-dark">+{pricing.coinsEarned} Shopee Coins earned with ShopeePay</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-600">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
