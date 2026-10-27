import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { formatDate } from '../../lib/format'
import { getProductById } from '../../mocks'
import type { DarkStore, StockRecord, Vendor } from '../../types'
import { RegistrationBadge, UnitCount } from './StatusBadges'

/** OWNER: Person 4 (Tech Lead). One card per importer: registration, then units per dark store. */

interface Props {
  vendors: Vendor[]
  stores: DarkStore[]
  stock: StockRecord[]
}

export default function VendorTab({ vendors, stores, stock }: Props) {
  return (
    <div className="space-y-4">
      {vendors.map((vendor) => {
        const lines = stock.filter((s) => s.vendorId === vendor.id)
        const productIds = [...new Set(lines.map((s) => s.productId))]
        const unitsAt = (productId: string, storeId: string) =>
          lines.find((s) => s.productId === productId && s.darkStoreId === storeId)?.units

        return (
          <article key={vendor.id} aria-labelledby={`vendor-${vendor.id}`} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id={`vendor-${vendor.id}`} className="text-lg font-semibold">
                {vendor.name}
              </h2>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
                ✓ Brand-authorised importer
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {vendor.legalName} · {vendor.city} · on Global Picks since {formatDate(vendor.onboardedAt)}
            </p>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Field label="CDSCO import registration (Form COS-2)">
                <span className="mr-2 font-mono">{vendor.importRegistration.number}</span>
                <RegistrationBadge validUntil={vendor.importRegistration.validUntil} />
              </Field>
              <Field label="Authorised brands">{vendor.authorisedBrands.join(', ')}</Field>
              <Field label="Importer-Exporter Code (IEC)">
                <span className="font-mono">{vendor.iec}</span>
              </Field>
              <Field label="GSTIN">
                <span className="font-mono">{vendor.gstin}</span>
              </Field>
            </dl>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-md text-sm">
                <caption className="sr-only">Units of each {vendor.name} product per Blinkit dark store</caption>
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Product
                    </th>
                    {stores.map((store) => (
                      <th key={store.id} scope="col" className="px-2 py-2 text-right font-medium">
                        {store.area}
                      </th>
                    ))}
                    <th scope="col" className="py-2 pl-2 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productIds.map((productId) => {
                    const total = lines.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.units, 0)
                    return (
                      <tr key={productId}>
                        <th scope="row" className="py-2 pr-3 text-left font-normal">
                          <Link to={`/product/${productId}`} className="hover:text-brand">
                            {getProductById(productId)?.title ?? productId}
                          </Link>
                        </th>
                        {stores.map((store) => {
                          const units = unitsAt(productId, store.id)
                          return (
                            <td key={store.id} className="px-2 py-2 text-right">
                              {units === undefined ? <span className="text-gray-400">not stocked</span> : <UnitCount units={units} />}
                            </td>
                          )
                        })}
                        <td className="py-2 pl-2 text-right font-semibold">{total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
