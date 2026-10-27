import { Link } from 'react-router'
import { formatDate } from '../../lib/format'
import { registrationStatus } from '../../lib/inventory'
import type { Product, Vendor } from '../../types'

/**
 * OWNER: Person 4 (Tech Lead). The "Evaluate" stage: who stands behind this
 * product. Global Picks name the brand-authorised importer and its import
 * registration; marketplace sellers are labelled verified or not, honestly.
 */
export default function TrustPanel({ product, vendor }: { product: Product; vendor?: Vendor }) {
  if (vendor) {
    const reg = vendor.importRegistration
    const status = registrationStatus(reg.validUntil)
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
        <p className="font-semibold text-green-800">✓ Brand-authorised import</p>
        <dl className="mt-1 space-y-0.5 text-gray-700">
          <div>
            <dt className="inline">Imported and sold by </dt>
            <dd className="inline font-medium">
              {vendor.name} <span className="font-normal text-gray-500">({vendor.legalName})</span>
            </dd>
          </div>
          <div>
            <dt className="inline">Authorised for </dt>
            <dd className="inline">{vendor.authorisedBrands.join(', ')}</dd>
          </div>
          <div>
            <dt className="inline">CDSCO import registration </dt>
            <dd className="inline">
              <span className="font-mono">{reg.number}</span>
              {status === 'expired' ? (
                <span className="text-red-700"> · expired {formatDate(reg.validUntil)}</span>
              ) : (
                <span className="text-gray-500"> · valid till {formatDate(reg.validUntil)}</span>
              )}
            </dd>
          </div>
        </dl>
        <Link to="/inventory" className="mt-1 inline-block text-green-800 underline">
          See stock and registration details
        </Link>
      </div>
    )
  }

  return (
    <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
      {product.isVerified ? (
        <>
          <span className="font-semibold text-brand">✓ Verified seller:</span> {product.seller}
        </>
      ) : (
        <>
          Sold by <span className="font-medium">{product.seller}</span>. This seller isn't verified by Shopee.
        </>
      )}
    </p>
  )
}
