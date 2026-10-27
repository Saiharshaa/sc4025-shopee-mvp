import { Link } from 'react-router'
import { formatRupees } from '../../lib/format'
import type { OrderItem } from '../../types'

/** OWNER: Person 4 (Tech Lead). Compact item list for a shipment. */
export default function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="mt-3 divide-y divide-gray-100 text-sm">
      {items.map((item) => (
        <li key={item.productId} className="flex items-center gap-3 py-2">
          <img src={item.imageUrl} alt="" className="h-12 w-12 flex-none rounded object-cover" />
          <Link to={`/product/${item.productId}`} className="min-w-0 flex-1 truncate hover:text-brand">
            {item.title}
          </Link>
          <span className="flex-none text-gray-500">× {item.quantity}</span>
          <span className="w-16 flex-none text-right">{formatRupees(item.unitPrice * item.quantity)}</span>
        </li>
      ))}
    </ul>
  )
}
