/**
 * Mock data layer — the ONLY place pages should get data from.
 * OWNER: Person 4 (Tech Lead).
 *
 *   import { getProducts, getProductById } from '../../mocks'
 *
 * Never import from src/mocks/data/* directly: going through these accessors
 * lets us change where data comes from without touching anyone's page.
 *
 * Accessors are synchronous (no loading states needed). Lists are returned as
 * fresh arrays, so sorting/filtering them in a page cannot corrupt the
 * fixtures. State changed by placeOrder() lives in memory only and resets on
 * a full page reload, which conveniently gives every usability-test session a
 * clean slate.
 */
import type {
  Address,
  Cart,
  Category,
  DarkStore,
  Order,
  OrderBreakdown,
  Product,
  StockRecord,
  User,
  Vendor,
  Voucher,
} from '../types'
import { INITIAL_CART } from './data/cart'
import { DARK_STORES, STOCK, VENDORS } from './data/inventory'
import { ORDERS } from './data/orders'
import { CATEGORY_LABELS, PRODUCTS } from './data/products'
import { INITIAL_COIN_BALANCE, USER } from './data/user'
import { VOUCHERS } from './data/vouchers'

// In-memory session state (mutated only by placeOrder).
let coinBalance = INITIAL_COIN_BALANCE
const orders: Order[] = [...ORDERS]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function getProducts(): Product[] {
  return [...PRODUCTS]
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getCategories(): { id: Category; label: string }[] {
  return (Object.keys(CATEGORY_LABELS) as Category[]).map((id) => ({ id, label: CATEGORY_LABELS[id] }))
}

// ---------------------------------------------------------------------------
// Blinkit inventory (Global Picks)
// ---------------------------------------------------------------------------

/** Brand-authorised importers that keep stock in Blinkit dark stores. */
export function getVendors(): Vendor[] {
  return [...VENDORS]
}

export function getVendorById(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id)
}

export function getDarkStores(): DarkStore[] {
  return [...DARK_STORES]
}

/** Every stock line: one per (product, dark store). */
export function getStockRecords(): StockRecord[] {
  return [...STOCK]
}

/** Where a product is stocked, one record per dark store. Empty if it isn't at Blinkit. */
export function getStockForProduct(productId: string): StockRecord[] {
  return STOCK.filter((s) => s.productId === productId)
}

// ---------------------------------------------------------------------------
// Vouchers & coins
// ---------------------------------------------------------------------------

/** All vouchers the user holds, including expired ones (see isVoucherExpired in src/lib/pricing.ts). */
export function getVouchers(): Voucher[] {
  return [...VOUCHERS]
}

export function getVoucherByCode(code: string): Voucher | undefined {
  const normalised = code.trim().toUpperCase()
  return VOUCHERS.find((v) => v.code === normalised)
}

/** Current Shopee Coins balance (1 coin = Rs 1). */
export function getCoinBalance(): number {
  return coinBalance
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

/**
 * The cart's starting contents. Pages should read the live cart from
 * useCart() (src/context/CartContext.tsx); this only seeds it.
 */
export function getCart(): Cart {
  return {
    items: INITIAL_CART.flatMap(({ productId, quantity }) => {
      const product = getProductById(productId)
      return product ? [{ product, quantity }] : []
    }),
  }
}

// ---------------------------------------------------------------------------
// User & orders
// ---------------------------------------------------------------------------

export function getUser(): User {
  return USER
}

/** Newest first. */
export function getOrders(): Order[] {
  return [...orders].sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id)
}

/**
 * Record a new order from checkout and deduct the coins it used.
 * `breakdown` must be the result of calculateOrderTotal() for this cart.
 */
export function placeOrder(cart: Cart, breakdown: OrderBreakdown, shippingAddress: Address): Order {
  if (cart.items.length === 0) throw new Error('Cannot place an order with an empty cart')
  if (breakdown.coins.applied > coinBalance) throw new Error('Not enough coins for this order')

  const now = new Date()
  const slowestEtaDays = Math.max(...cart.items.map((i) => i.product.etaDays))
  const eta = new Date(now)
  eta.setDate(eta.getDate() + slowestEtaDays)

  const order: Order = {
    id: `ORD-${1000 + orders.length + 1}`,
    placedAt: now.toISOString(),
    status: 'placed',
    items: cart.items.map(({ product, quantity }) => ({
      productId: product.id,
      title: product.title,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      speedTier: product.speedTier,
    })),
    pricing: {
      subtotal: breakdown.subtotal,
      voucherCode: breakdown.voucher?.eligible ? breakdown.voucher.code : null,
      voucherDiscount: breakdown.voucherDiscount,
      shippingFee: breakdown.shipping.fee,
      coinsUsed: breakdown.coins.applied,
      total: breakdown.total,
    },
    shippingAddress,
    estimatedDelivery: toLocalIsoDate(eta),
    timeline: [{ status: 'placed', at: now.toISOString() }],
  }

  coinBalance -= breakdown.coins.applied
  orders.push(order)
  return order
}

function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
