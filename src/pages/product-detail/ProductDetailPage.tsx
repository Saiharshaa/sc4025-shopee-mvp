import { useParams } from 'react-router'

/**
 * Route:  /product/:id
 * OWNER:  Person 3 (Designer)
 * Scope:  Product detail page.
 *
 * Only Person 3 edits files in src/pages/product-detail/. This is a placeholder: replace freely.
 * Useful data: getProductById(id) from src/mocks (returns undefined for unknown ids).
 * Add to cart with: const { addItem } = useCart(); addItem(product, quantity)
 */
export default function ProductDetailPage() {
  const { id } = useParams()

  return (
    <section>
      <h1 className="text-2xl font-bold">Product detail</h1>
      <p className="mt-2 text-gray-500">Placeholder: owned by Person 3 (Designer).</p>
      <p className="mt-1 text-sm text-gray-400">Product id: {id}</p>
    </section>
  )
}
