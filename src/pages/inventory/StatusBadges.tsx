import { formatDate } from '../../lib/format'
import { registrationStatus, stockStatus } from '../../lib/inventory'

/** OWNER: Person 4 (Tech Lead). Status is always spelled out, never colour alone. */

export function UnitCount({ units }: { units: number }) {
  const status = stockStatus(units)
  if (status === 'in-stock') return <span>{units}</span>
  return (
    <span className={`whitespace-nowrap font-medium ${status === 'out' ? 'text-red-700' : 'text-amber-700'}`}>
      {units}
      <span className="ml-1 rounded bg-current/10 px-1 py-0.5 text-xs">{status === 'out' ? 'Out' : 'Low'}</span>
    </span>
  )
}

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
