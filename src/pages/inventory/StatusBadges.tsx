import { formatDate } from '../../lib/format'
import { LOW_STOCK_DAYS, daysOfInventory, registrationStatus, stockStatus } from '../../lib/inventory'

/** OWNER: Person 4 (Tech Lead). Status is always spelled out, never colour alone. */

/** Units plus days of inventory (US11). Low = under LOW_STOCK_DAYS days at the current sales rate. */
export function StockCell({ units, avgDailySales }: { units: number; avgDailySales: number }) {
  const status = stockStatus(units, avgDailySales)
  const days = daysOfInventory(units, avgDailySales)
  const daysText =
    status === 'out' ? 'restock now' : days === Number.POSITIVE_INFINITY ? 'not selling' : `${days < 10 ? days.toFixed(1) : Math.round(days)} days`
  return (
    <span className={`inline-block whitespace-nowrap text-right ${status === 'out' ? 'text-red-700' : status === 'low' ? 'text-amber-700' : ''}`}>
      <span className="font-medium">{units}</span>
      {status !== 'in-stock' && (
        <span className="ml-1 rounded bg-current/10 px-1 py-0.5 text-xs font-medium">{status === 'out' ? 'Out' : 'Low'}</span>
      )}
      <span className={`block text-xs ${status === 'in-stock' ? 'text-gray-500' : ''}`}>
        <span className="sr-only">Days of inventory: </span>
        {daysText}
      </span>
    </span>
  )
}

export const LOW_STOCK_NOTE = `Low = under ${LOW_STOCK_DAYS} days of stock at the current sales rate.`

export function RegistrationBadge({ validUntil }: { validUntil: string }) {
  const status = registrationStatus(validUntil)
  const date = formatDate(validUntil)
  const { text, className } = {
    valid: { text: `Valid till ${date}`, className: 'bg-green-50 text-green-800' },
    'renewal-due': { text: `Renewal due by ${date}`, className: 'bg-amber-50 text-amber-800' },
    expired: { text: `Expired ${date}`, className: 'bg-red-50 text-red-700' },
  }[status]
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{text}</span>
}
