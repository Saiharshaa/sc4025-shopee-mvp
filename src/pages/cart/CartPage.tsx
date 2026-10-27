import { Link } from 'react-router'
import { MAX_QUANTITY } from '../../context/cartContext'
import { useCart } from '../../context/useCart'
import { formatRupees } from '../../lib/format'
import { calculateOrderTotal } from '../../lib/pricing'
import { getBlinkitAvailability } from '../../mocks'

/**
 * Route:  /cart
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Cart line items and quantities, with a progress bar to free
 *         shipping. Global Picks show their Blinkit delivery time and can't
 *         exceed the units at the nearby store. Vouchers and coins are at checkout.
 */
export default function CartPage() {
  const { cart, setQuantity, removeItem } = useCart()

  if (cart.items.length === 0) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/products" className="mt-4 inline-block text-brand underline">
          Browse products
        </Link>
      </section>
    )
  }

  // Pre-voucher view: shipping here assumes no voucher; checkout recalculates.
  const breakdown = calculateOrderTotal(cart, null, 0)
  const { shipping } = breakdown

  return (
    <section>
      <h1 className="text-2xl font-bold">Cart ({breakdown.itemCount})</h1>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
          {cart.items.map(({ product, quantity }) => {
            const availability = getBlinkitAvailability(product.id)
            const maxQuantity = availability ? Math.min(MAX_QUANTITY, availability.units) : MAX_QUANTITY
            return (
              <li key={product.id} className="flex gap-4 p-4">
                <img src={product.imageUrl} alt="" className="h-20 w-20 flex-none rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${product.id}`} className="line-clamp-2 font-medium hover:text-brand">
                    {product.title}
                  </Link>
                  <p className="text-sm text-gray-500">{product.seller}</p>
                  {availability && availability.units > 0 && (
                    <p className="mt-0.5 text-xs font-medium">
                      <span className="rounded bg-yellow-300 px-1">⚡ {availability.store.avgDeliveryMinutes} min</span> from{' '}
                      {availability.store.name}
                      {quantity >= maxQuantity && <span className="text-amber-700"> · only {availability.units} left nearby</span>}
                    </p>
                  )}
                  <p className="mt-1 text-sm">{formatRupees(product.price)}</p>
  
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded border border-gray-300">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.title}`}
                        className="px-3 py-1 disabled:opacity-40"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity(product.id, quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.title}`}
                        className="px-3 py-1 disabled:opacity-40"
                        disabled={quantity >= maxQuantity}
                        onClick={() => setQuantity(product.id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-500 underline hover:text-brand"
                      onClick={() => removeItem(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="flex-none font-semibold">{formatRupees(product.price * quantity)}</p>
              </li>
            )
          })}
        </ul>

        <aside className="h-fit rounded-lg bg-white p-4 shadow-sm">
          <dl className="flex justify-between text-lg font-semibold">
            <dt>Subtotal</dt>
            <dd>{formatRupees(breakdown.subtotal)}</dd>
          </dl>

          <div className={`mt-3 rounded p-2 text-sm ${shipping.waived ? 'bg-green-50 text-green-800' : 'bg-brand-light text-brand-dark'}`}>
            <p>
              {shipping.waived
                ? `Free shipping unlocked on orders of ${formatRupees(shipping.threshold)}+`
                : `Add ${formatRupees(shipping.amountToFreeShipping)} more for free shipping`}
            </p>
            <div
              role="progressbar"
              aria-label="Progress to free shipping"
              aria-valuemin={0}
              aria-valuemax={shipping.threshold}
              aria-valuenow={Math.min(breakdown.subtotal, shipping.threshold)}
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-white"
            >
              <div
                className={`h-full rounded-full ${shipping.waived ? 'bg-green-600' : 'bg-brand'}`}
                style={{ width: `${Math.min(100, (breakdown.subtotal / shipping.threshold) * 100)}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Vouchers and Shopee Coins are applied at checkout. Free shipping is based on your total after vouchers.
          </p>

          <Link
            to="/checkout"
            className="mt-4 block rounded bg-brand py-2.5 text-center font-semibold text-white hover:bg-brand-dark"
          >
            Check out
          </Link>
        </aside>
      </div>
    </section>
  )
}
