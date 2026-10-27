import { Link } from 'react-router'
import { deliveryLabel, discountPercent } from '../../lib/catalogue'
import { formatRupees } from '../../lib/format'
import type { BlinkitAvailability, Product } from '../../types'

/**
 * Product tile for grids and shelves.
 * OWNER: Person 4 (Tech Lead). Presentational only: the page looks up
 * `availability` (getBlinkitAvailability) and passes it in.
 */

interface Props {
  product: Product
  /** Present when the product is a Global Pick for this shopper. */
  availability?: BlinkitAvailability
}

export default function ProductCard({ product, availability }: Props) {
  const discount = discountPercent(product)
  const quick = availability && availability.units > 0 ? availability.store.avgDeliveryMinutes : undefined

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-100">
        <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        {discount > 0 && (
          <span className="absolute right-0 top-0 rounded-bl bg-brand-light px-1.5 py-0.5 text-xs font-semibold text-brand">
            −{discount}%
          </span>
        )}
        {availability && (
          <span
            className={`absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
              quick === undefined ? 'bg-gray-800/80 text-white' : 'bg-yellow-300 text-gray-900'
            }`}
          >
            {quick === undefined ? 'Out of stock nearby' : `⚡ ${quick} min`}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-2 text-sm group-hover:text-brand">{product.title}</p>
        <p className="mt-1 flex flex-wrap gap-1 text-[11px] font-medium">
          {availability ? (
            <span className="rounded border border-green-700 px-1 text-green-800">Brand-authorised</span>
          ) : (
            product.isVerified && <span className="rounded border border-brand px-1 text-brand">Verified</span>
          )}
          {product.isImported && !availability && <span className="rounded bg-gray-100 px-1 text-gray-600">Ships from overseas</span>}
        </p>

        <p className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
          <span className="font-semibold text-brand">{formatRupees(product.price)}</span>
          {product.originalPrice && (
            <s className="text-xs text-gray-400">
              <span className="sr-only">was </span>
              {formatRupees(product.originalPrice)}
            </s>
          )}
        </p>
        <p className="mt-0.5 flex justify-between gap-2 text-xs text-gray-500">
          <span>
            <span aria-hidden="true">★</span>
            <span className="sr-only">Rated</span> {product.rating.toFixed(1)}
          </span>
          <span>{deliveryLabel(product, quick)}</span>
        </p>
      </div>
    </Link>
  )
}
