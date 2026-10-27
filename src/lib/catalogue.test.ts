import { describe, expect, it } from 'vitest'
import type { Product } from '../types'
import { NO_FILTERS, deliveryLabel, discountPercent, filterProducts, matchesQuery, sortProducts } from './catalogue'

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    title: `Product ${id}`,
    description: '',
    price: 100,
    imageUrl: '',
    seller: 'Test seller',
    isImported: false,
    isVerified: true,
    speedTier: 'standard',
    etaDays: 3,
    rating: 4,
    category: 'beauty',
    ...overrides,
  }
}

const sunscreen = product('a', { title: 'Haneul Rice Sunscreen SPF 50', price: 899, originalPrice: 1099, rating: 4.6 })
const toner = product('b', { title: 'Heartleaf Toner', description: 'Calming, for sunscreen days', price: 1199, rating: 4.5 })
const kurta = product('c', { title: 'Cotton Kurta', category: 'fashion', price: 649, originalPrice: 1199, isVerified: false, rating: 4.4 })
const charger = product('d', { title: 'GaN Charger', category: 'mobile-accessories', seller: 'Shenzhen Direct Store', price: 1199, rating: 4.7 })
const all = [sunscreen, toner, kurta, charger]
const ids = (ps: Product[]) => ps.map((p) => p.id)

describe('discountPercent', () => {
  it('is 0 when not on deal', () => {
    expect(discountPercent(toner)).toBe(0)
  })

  it('rounds DOWN so a deal is never overstated', () => {
    // (1099 - 899) / 1099 = 18.2% -> 18; (1199 - 649) / 1199 = 45.9% -> 45
    expect(discountPercent(sunscreen)).toBe(18)
    expect(discountPercent(kurta)).toBe(45)
  })
})

describe('matchesQuery', () => {
  it('matches every word, case-insensitively, across title, description, seller and category', () => {
    expect(matchesQuery(sunscreen, 'RICE sunscreen')).toBe(true)
    expect(matchesQuery(toner, 'sunscreen')).toBe(true) // description
    expect(matchesQuery(charger, 'shenzhen')).toBe(true) // seller
    expect(matchesQuery(charger, 'mobile accessories')).toBe(true) // category
    expect(matchesQuery(sunscreen, 'rice toner')).toBe(false)
  })

  it('an empty or blank query matches everything', () => {
    expect(matchesQuery(kurta, '')).toBe(true)
    expect(matchesQuery(kurta, '   ')).toBe(true)
  })
})

describe('filterProducts', () => {
  it('no filters keeps everything in order', () => {
    expect(ids(filterProducts(all, NO_FILTERS))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('combines every filter with AND', () => {
    expect(ids(filterProducts(all, { ...NO_FILTERS, category: 'beauty' }))).toEqual(['a', 'b'])
    expect(ids(filterProducts(all, { ...NO_FILTERS, verifiedOnly: true, dealsOnly: true }))).toEqual(['a'])
    expect(ids(filterProducts(all, { ...NO_FILTERS, onlyIds: new Set(['b', 'd']), category: 'beauty' }))).toEqual(['b'])
    expect(ids(filterProducts(all, { ...NO_FILTERS, query: 'sunscreen', dealsOnly: true }))).toEqual(['a'])
  })
})

describe('sortProducts', () => {
  it('sorts by price both ways, keeping catalogue order for ties', () => {
    expect(ids(sortProducts(all, 'price-asc'))).toEqual(['c', 'a', 'b', 'd'])
    expect(ids(sortProducts(all, 'price-desc'))).toEqual(['b', 'd', 'a', 'c'])
  })

  it('sorts by rating and by discount, best first', () => {
    expect(ids(sortProducts(all, 'rating'))).toEqual(['d', 'a', 'b', 'c'])
    expect(ids(sortProducts(all, 'discount'))).toEqual(['c', 'a', 'b', 'd'])
  })

  it('relevance puts title matches before description-only matches', () => {
    expect(ids(sortProducts([toner, sunscreen], 'relevance', 'sunscreen'))).toEqual(['a', 'b'])
    expect(ids(sortProducts([toner, sunscreen], 'relevance'))).toEqual(['b', 'a'])
  })

  it('never mutates its input', () => {
    const input = [...all]
    sortProducts(input, 'price-asc')
    expect(ids(input)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('deliveryLabel', () => {
  it('prefers the Blinkit minutes when the product is in stock nearby', () => {
    expect(deliveryLabel(sunscreen, 11)).toBe('11 min')
  })

  it('falls back to the seller ETA', () => {
    expect(deliveryLabel(product('x', { etaDays: 0 }))).toBe('Today')
    expect(deliveryLabel(product('x', { etaDays: 1 }))).toBe('Tomorrow')
    expect(deliveryLabel(product('x', { etaDays: 4 }))).toBe('4 days')
  })
})
