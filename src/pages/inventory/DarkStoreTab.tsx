import { formatDate } from '../../lib/format'
import { stockStatus } from '../../lib/inventory'
import { getProductById, getVendorById } from '../../mocks'
import type { DarkStore, StockRecord } from '../../types'
import { StockCell } from './StatusBadges'

/** OWNER: Person 4 (Tech Lead). One card per Blinkit dark store: what's on its shelves and whose it is. */

interface Props {
  stores: DarkStore[]
  stock: StockRecord[]
}

export default function DarkStoreTab({ stores, stock }: Props) {
  return (
    <div className="space-y-4">
      {stores.map((store) => {
        const lines = stock.filter((s) => s.darkStoreId === store.id)
        const units = lines.reduce((sum, s) => sum + s.units, 0)
        const needsRestock = lines.filter((s) => stockStatus(s.units, s.avgDailySales) !== 'in-stock').length

        return (
          <article key={store.id} aria-labelledby={`store-${store.id}`} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id={`store-${store.id}`} className="text-lg font-semibold">
                {store.name}
              </h2>
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                ~{store.avgDeliveryMinutes} min delivery
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {store.area}, {store.city} · {units} units across {lines.length} products
              {needsRestock > 0 && (
                <span className="text-amber-700">
                  {' '}
                  · {needsRestock} {needsRestock === 1 ? 'needs' : 'need'} restocking
                </span>
              )}
            </p>

            <div className="relative mt-3 overflow-x-auto">
              <table className="w-full min-w-md text-sm">
                <caption className="sr-only">Global Picks stock at {store.name}</caption>
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Product
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      Importer
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-medium">
                      Units · days left
                    </th>
                    <th scope="col" className="py-2 pl-2 text-right font-medium">
                      Last restocked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line) => (
                    <tr key={line.productId}>
                      <th scope="row" className="py-2 pr-3 text-left font-normal">
                        {getProductById(line.productId)?.title ?? line.productId}
                      </th>
                      <td className="px-2 py-2 text-gray-600">{getVendorById(line.vendorId)?.name ?? line.vendorId}</td>
                      <td className="px-2 py-2 text-right">
                        <StockCell units={line.units} avgDailySales={line.avgDailySales} />
                      </td>
                      <td className="whitespace-nowrap py-2 pl-2 text-right text-gray-600">
                        {formatDate(line.lastRestockedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )
      })}
    </div>
  )
}
