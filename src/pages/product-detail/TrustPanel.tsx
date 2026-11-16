import { useState, type ReactNode } from 'react'
import Sheet from '../../components/ui/Sheet'
import { formatDate } from '../../lib/format'
import { registrationStatus } from '../../lib/inventory'
import type { Product, Vendor } from '../../types'

/**
 * OWNER: Person 4 (Tech Lead). The "Evaluate" stage (US2): who stands behind
 * this product. Global Picks show the brand-authorised badge, importer,
 * CDSCO registration, country of origin, batch and expiry; tapping the badge
 * opens a sheet explaining the check and the money-back guarantee.
 * Marketplace sellers are labelled verified or, honestly, not verified.
 */
export default function TrustPanel({ product, vendor }: { product: Product; vendor?: Vendor }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  if (vendor) {
    const reg = vendor.importRegistration
    const status = registrationStatus(reg.validUntil)
    const auth = product.authenticity
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex flex-wrap items-center gap-1.5 text-left font-semibold text-green-800"
        >
          ✓ Brand-authorised import
          <span className="rounded-full border border-green-700 px-1.5 text-xs font-medium">How we check</span>
        </button>
        <dl className="mt-1 space-y-0.5 text-gray-700">
          <Fact label="Imported and sold by">
            <span className="font-medium">{vendor.name}</span> <span className="text-gray-500">({vendor.legalName})</span>
          </Fact>
          <Fact label="CDSCO import registration">
            <span className="font-mono">{reg.number}</span>
            {status === 'expired' && <span className="text-red-700"> · expired {formatDate(reg.validUntil)}</span>}
          </Fact>
          {auth && (
            <>
              <Fact label="Country of origin">{auth.countryOfOrigin}</Fact>
              <Fact label="Batch">
                <span className="font-mono">{auth.batchNo}</span> · expires {formatDate(auth.expiryDate)}
              </Fact>
            </>
          )}
        </dl>

        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} labelledBy="auth-title">
          <h2 id="auth-title" className="pr-8 text-lg font-bold">
            How we check Global Picks
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
            <li>
              <strong>The brand authorises the importer.</strong> {vendor.name} is authorised to sell{' '}
              {vendor.authorisedBrands.join(' and ')} in India.
            </li>
            <li>
              <strong>The import is registered.</strong> Imported cosmetics must be registered with CDSCO, India's drug
              and cosmetics regulator. This importer holds registration <span className="font-mono">{reg.number}</span>.
            </li>
            <li>
              <strong>No resellers in between.</strong> Stock goes from the importer straight to the Blinkit store that
              delivers to you, so the batch shown is the batch you receive.
            </li>
          </ol>
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
            <p className="font-semibold">Money-back authenticity guarantee</p>
            <p className="mt-0.5">If a Global Pick turns out not to be genuine, we refund you in full.</p>
          </div>
          <p className="mt-3 text-xs text-gray-500">Prototype: importer, registration and batch details are sample data.</p>
        </Sheet>
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

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  )
}
