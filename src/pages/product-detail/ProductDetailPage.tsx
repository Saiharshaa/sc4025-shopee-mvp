import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ProductCard from '../../components/ui/ProductCard'
import { MAX_QUANTITY } from '../../context/cartContext'
import { useCart } from '../../context/useCart'
import { discountPercent } from '../../lib/catalogue'
import { formatDate, formatRupees } from '../../lib/format'
import { LOW_STOCK_THRESHOLD } from '../../lib/inventory'
import { calculateCashback } from '../../lib/pricing'
import {
  getBlinkitAvailability,
  getCategories,
  getProductById,
  getProducts,
  getStockForProduct,
  getUser,
  getVendorById,
} from '../../mocks'
import type { Product } from '../../types'
import TrustPanel from './TrustPanel'

/**
 * Route:  /product/:id
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  Product detail: the "Evaluate" stage. Trust panel (importer +
 *         registration for Global Picks), delivery promise, Coins preview,
 *         quantity capped by nearby Blinkit stock, Add to cart / Buy now.
 */
export default function ProductDetailPage() {
  const { id = '' } = useParams()
  const product = getProductById(id)

  if (!product) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-brand underline">
          Browse products
        </Link>
      </section>
    )
  }

  // key resets quantity and the "added" message when moving to another product.
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { cart, addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState<number | null>(null)

  const availability = getBlinkitAvailability(product.id)
  const vendorId = getStockForProduct(product.id)[0]?.vendorId
  const vendor = vendorId ? getVendorById(vendorId) : undefined
  const address = getUser().defaultAddress
  const category = getCategories().find((c) => c.id === product.category)
  const discount = discountPercent(product)

  // Global Picks can only sell what the nearby dark store holds.
  const inCart = cart.items.find((i) => i.product.id === product.id)?.quantity ?? 0
  const stockLimit = availability ? availability.units : MAX_QUANTITY
  const canAdd = Math.max(0, Math.min(MAX_QUANTITY, stockLimit) - inCart)
  const qty = Math.min(quantity, Math.max(1, canAdd))
  const coins = calculateCashback(product.price * qty, 'shopeepay').coinsEarned

  const related = getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  function handleAdd(thenCheckout: boolean) {
    addItem(product, qty)
    if (thenCheckout) navigate('/checkout')
    else {
      setAdded(qty)
      setQuantity(1)
    }
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>
        {' / '}
        <Link to={`/products?category=${product.category}`} className="hover:text-brand">
          {category?.label}
        </Link>
      </nav>

      <section className="grid grid-cols-1 gap-6 rounded-lg bg-white p-4 shadow-sm md:grid-cols-[2fr_3fr]">
        <img src={product.imageUrl} alt="" className="aspect-square w-full rounded object-cover" />

        <div className="min-w-0 space-y-4">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">{product.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              <span aria-hidden="true">★</span>
              <span className="sr-only">Rated</span> {product.rating.toFixed(1)} · {product.seller}
            </p>
          </div>

          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded bg-gray-50 p-3">
            <span className="text-3xl font-bold text-brand">{formatRupees(product.price)}</span>
            {product.originalPrice && (
              <>
                <s className="text-gray-400">
                  <span className="sr-only">was </span>
                  {formatRupees(product.originalPrice)}
                </s>
                <span className="rounded bg-brand px-1.5 py-0.5 text-xs font-semibold text-white">{discount}% off</span>
              </>
            )}
          </p>

          <DeliveryPromise product={product} availability={availability} area={`${address.city} ${address.pincode}`} />

          <TrustPanel product={product} vendor={vendor} />

          {canAdd > 0 && coins > 0 && (
            <p className="text-sm">
              <span aria-hidden="true">🪙</span> Earn up to <strong>{coins} Shopee Coins</strong> when you pay with ShopeePay
            </p>
          )}

          {canAdd > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded border border-gray-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="px-3 py-2 disabled:opacity-40"
                  disabled={qty <= 1}
                  onClick={() => setQuantity(qty - 1)}
                >
                  −
                </button>
                <span className="w-10 text-center" aria-live="polite">
                  <span className="sr-only">Quantity </span>
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="px-3 py-2 disabled:opacity-40"
                  disabled={qty >= canAdd}
                  onClick={() => setQuantity(qty + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(false)}
                className="rounded border border-brand bg-brand-light px-4 py-2 font-semibold text-brand hover:bg-brand/10"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => handleAdd(true)}
                className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
              >
                Buy now
              </button>
            </div>
          ) : (
            <p className="rounded bg-gray-100 p-3 text-sm text-gray-700">
              {inCart > 0
                ? `All ${inCart} available near you are already in your cart.`
                : `Out of stock at ${availability?.store.name ?? 'your nearest store'} right now.`}
            </p>
          )}

          <p role="status" className="min-h-5 text-sm text-green-700">
            {added !== null && (
              <>
                Added {added} to your cart.{' '}
                <Link to="/cart" className="font-medium underline">
                  View cart
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      <section aria-labelledby="about" className="mt-4 rounded-lg bg-white p-4 shadow-sm">
        <h2 id="about" className="font-semibold">
          About this product
        </h2>
        <p className="mt-1 text-sm text-gray-700">{product.description}</p>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-6">
          <h2 id="related" className="text-lg font-bold">
            More in {category?.label}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <li key={p.id} className="flex">
                <ProductCard product={p} availability={getBlinkitAvailability(p.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function DeliveryPromise({
  product,
  availability,
  area,
}: {
  product: Product
  availability: ReturnType<typeof getBlinkitAvailability>
  area: string
}) {
  // Captured once on mount so re-renders don't change the promised date.
  const [eta] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + product.etaDays)
    return d
  })

  if (availability && availability.units > 0) {
    return (
      <div className="rounded-lg bg-yellow-50 p-3 text-sm">
        <p className="font-semibold">
          ⚡ Delivered in ~{availability.store.avgDeliveryMinutes} min from {availability.store.name}
        </p>
        <p className="text-gray-600">
          To {area}
          {availability.units <= LOW_STOCK_THRESHOLD && (
            <span className="font-medium text-amber-700"> · Only {availability.units} left nearby</span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-50 p-3 text-sm">
      <p className="font-semibold">
        {product.etaDays === 0 ? 'Delivered today' : `Delivered by ${formatDate(eta.toISOString())}`}
      </p>
      <p className="text-gray-600">
        To {area}
        {product.isImported && ' · Ships from overseas'}
      </p>
    </div>
  )
}
