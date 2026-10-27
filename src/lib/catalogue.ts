/**
 * Catalogue search, filters, sorting and display labels for product lists.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 */
import type { Product, ProductFilters, ProductSort } from '../types'

export const NO_FILTERS: ProductFilters = {
  query: '',
  category: null,
  onlyIds: null,
  verifiedOnly: false,
  dealsOnly: false,
}

/** Whole-number % off the original price, rounded DOWN so a deal is never overstated. 0 if not on deal. */
export function discountPercent(product: Product): number {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0
  return Math.floor(((product.originalPrice - product.price) * 100) / product.originalPrice)
}

function searchText(product: Product): string {
  return `${product.title} ${product.description} ${product.seller} ${product.category.replace('-', ' ')}`.toLowerCase()
}

/** Every word in the query must appear somewhere (case-insensitive). An empty query matches everything. */
export function matchesQuery(product: Product, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const text = searchText(product)
  return words.every((w) => text.includes(w))
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(
    (p) =>
      matchesQuery(p, filters.query) &&
      (filters.category === null || p.category === filters.category) &&
      (filters.onlyIds === null || filters.onlyIds.has(p.id)) &&
      (!filters.verifiedOnly || p.isVerified) &&
      (!filters.dealsOnly || discountPercent(p) > 0),
  )
}

/**
 * Returns a new array. "relevance" keeps catalogue order, except that with a
 * query, products whose TITLE matches come before description-only matches.
 * Ties always keep catalogue order (Array.prototype.sort is stable).
 */
export function sortProducts(products: Product[], sort: ProductSort, query = ''): Product[] {
  const sorted = [...products]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'discount':
      return sorted.sort((a, b) => discountPercent(b) - discountPercent(a))
    case 'relevance': {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean)
      if (words.length === 0) return sorted
      const inTitle = (p: Product) => (words.every((w) => p.title.toLowerCase().includes(w)) ? 0 : 1)
      return sorted.sort((a, b) => inTitle(a) - inTitle(b))
    }
  }
}

/**
 * Short delivery promise for cards: "11 min" when it's in stock at the
 * shopper's Blinkit store, otherwise based on the seller's ETA.
 */
export function deliveryLabel(product: Product, quickMinutes?: number): string {
  if (quickMinutes !== undefined) return `${quickMinutes} min`
  if (product.etaDays === 0) return 'Today'
  if (product.etaDays === 1) return 'Tomorrow'
  return `${product.etaDays} days`
}
