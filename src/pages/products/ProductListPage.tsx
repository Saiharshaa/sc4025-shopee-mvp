/**
 * Route:  /products
 * OWNER:  Person 2 (Analyst)
 * Scope:  Product listing, search and filters.
 *
 * Only Person 2 edits files in src/pages/products/. This is a placeholder: replace freely.
 * Useful data: getProducts(), getCategories() from src/mocks. Filterable fields
 * on Product: category, price, rating, isImported, isVerified, speedTier, etaDays.
 * Link each product to `/product/${product.id}`.
 */
export default function ProductListPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="mt-2 text-gray-500">Placeholder: owned by Person 2 (Analyst).</p>
    </section>
  )
}
