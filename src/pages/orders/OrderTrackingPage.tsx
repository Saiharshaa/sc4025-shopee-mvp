import { useParams } from 'react-router'

/**
 * Route:  /orders/:id
 * OWNER:  Person 5 (GTM)
 * Scope:  Order tracking.
 *
 * Only Person 5 edits files in src/pages/orders/. This is a placeholder: replace freely.
 * Useful data: getOrderById(id), getOrders() from src/mocks. Sample ids:
 * ORD-1001 (delivered), ORD-1002 (shipped, imported), ORD-1003 (out for delivery).
 * Checkout redirects here with the id of the newly placed order.
 */
export default function OrderTrackingPage() {
  const { id } = useParams()

  return (
    <section>
      <h1 className="text-2xl font-bold">Order tracking</h1>
      <p className="mt-2 text-gray-500">Placeholder: owned by Person 5 (GTM).</p>
      <p className="mt-1 text-sm text-gray-400">Order id: {id}</p>
    </section>
  )
}
