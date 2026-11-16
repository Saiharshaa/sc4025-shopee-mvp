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
  BlinkitAvailability,
  Cart,
  Category,
  DarkStore,
  Order,
  OrderBreakdown,
  PaymentMethod,
  Product,
  StockRecord,
  User,
  Vendor,
  Voucher,
} from '../types'
import { calculateCashback } from '../lib/pricing'
import { INITIAL_CART } from './data/cart'
import { DARK_STORES, STOCK, VENDORS } from './data/inventory'
import { ORDERS } from './data/orders'
import { CATEGORY_LABELS, PRODUCTS } from './data/products'
import { INITIAL_COIN_BALANCE, INITIAL_COINS_EXPIRE_AT, USER } from './data/user'
import { VOUCHERS } from './data/vouchers'

// In-memory session state (mutated only by placeOrder).
let coinBalance = INITIAL_COIN_BALANCE
/** orderId -> ISO time its ShopeePay cashback was credited. */
const creditedAt = new Map<string, string>()

// Change notifications, so pages showing session state re-render when it changes
// outside a user action (e.g. cashback credited on delivery). See hooks/useMockData.
let version = 0
const listeners = new Set<() => void>()
function changed() {
  version++
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getVersion(): number {
  return version
}
const orders: Order[] = [...ORDERS]
const stock: StockRecord[] = STOCK.map((s) => ({ ...s }))

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

/** Every stock line: one per (product, dark store). Copies, so pages can't change live stock. */
export function getStockRecords(): StockRecord[] {
  return stock.map((s) => ({ ...s }))
}

/** Where a product is stocked, one record per dark store. Empty if it isn't at Blinkit. */
export function getStockForProduct(productId: string): StockRecord[] {
  return stock.filter((s) => s.productId === productId).map((s) => ({ ...s }))
}

/** The dark store that delivers to this pincode, if any. */
export function getDarkStoreForPincode(pincode: string): DarkStore | undefined {
  return DARK_STORES.find((s) => s.pincodes.includes(pincode))
}

/**
 * A product's stock at the dark store serving the demo shopper's default
 * address. undefined if the product isn't stocked there (i.e. not a Global
 * Pick for this shopper); `units` is 0 when it's out of stock nearby.
 */
export function getBlinkitAvailability(productId: string): BlinkitAvailability | undefined {
  const store = getDarkStoreForPincode(USER.defaultAddress.pincode)
  const record = store && stock.find((s) => s.productId === productId && s.darkStoreId === store.id)
  return store && record
    ? { store, units: record.units, vendorId: record.vendorId, lastRestockedAt: record.lastRestockedAt }
    : undefined
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

/** Spendable Shopee Coins (1 coin = Rs 1). Cashback only counts once credited. */
export function getCoinBalance(): number {
  return coinBalance
}

/** When the starting balance expires. Credited cashback expires per src/lib/rewards.ts. */
export function getInitialCoinsExpiry(): string {
  return INITIAL_COINS_EXPIRE_AT
}

/**
 * US9: credit an order's ShopeePay cashback once it has been delivered.
 * Idempotent: returns the Coins credited by THIS call (0 if already done or
 * nothing was earned). The caller decides delivery (isOrderDelivered).
 */
export function creditCashback(orderId: string, at: Date = new Date()): number {
  const order = orders.find((o) => o.id === orderId)
  if (!order || order.pricing.coinsEarned === 0 || creditedAt.has(orderId)) return 0
  creditedAt.set(orderId, at.toISOString())
  coinBalance += order.pricing.coinsEarned
  changed()
  return order.pricing.coinsEarned
}

/** ISO time the order's cashback was credited, or undefined while pending. */
export function getCashbackCreditedAt(orderId: string): string | undefined {
  return creditedAt.get(orderId)
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
 * Record a new order from checkout and deduct the coins it used. Its ShopeePay
 * cashback (rule 9 in src/lib/pricing.ts) is recorded but only credited after
 * delivery (creditCashback). Global Picks are sent from the Blinkit store
 * serving the delivery pincode, and its stock goes down.
 * `breakdown` must be the result of calculateOrderTotal() for this cart.
 */
export function placeOrder(
  cart: Cart,
  breakdown: OrderBreakdown,
  shippingAddress: Address,
  paymentMethod: PaymentMethod,
): Order {
  if (cart.items.length === 0) throw new Error('Cannot place an order with an empty cart')
  if (breakdown.coins.applied > coinBalance) throw new Error('Not enough coins for this order')

  // Check every Global Pick is in stock nearby before changing anything.
  const store = getDarkStoreForPincode(shippingAddress.pincode)
  const stockLines = cart.items.map(({ product, quantity }) => {
    const line = store && stock.find((s) => s.productId === product.id && s.darkStoreId === store.id)
    if (line && line.units < quantity) {
      throw new Error(`Only ${line.units} of ${product.title} left at ${store.name}`)
    }
    return line
  })

  const cashback = calculateCashback(breakdown.total, paymentMethod)
  const now = new Date()
  const slowestEtaDays = Math.max(...cart.items.map((i) => i.product.etaDays))
  const eta = new Date(now)
  eta.setDate(eta.getDate() + slowestEtaDays)

  const order: Order = {
    id: `ORD-${1000 + orders.length + 1}`,
    placedAt: now.toISOString(),
    status: 'placed',
    items: cart.items.map(({ product, quantity }, i) => ({
      productId: product.id,
      title: product.title,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      speedTier: product.speedTier,
      ...(stockLines[i] && { darkStoreId: stockLines[i].darkStoreId }),
    })),
    pricing: {
      subtotal: breakdown.subtotal,
      voucherCode: breakdown.voucher?.eligible ? breakdown.voucher.code : null,
      voucherDiscount: breakdown.voucherDiscount,
      shippingFee: breakdown.shipping.fee,
      coinsUsed: breakdown.coins.applied,
      total: breakdown.total,
      paymentMethod,
      coinsEarned: cashback.coinsEarned,
    },
    shippingAddress,
    estimatedDelivery: toLocalIsoDate(eta),
    timeline: [{ status: 'placed', at: now.toISOString() }],
  }

  cart.items.forEach(({ quantity }, i) => {
    const line = stockLines[i]
    if (line) line.units -= quantity
  })
  coinBalance -= breakdown.coins.applied
  orders.push(order)
  changed()
  return order
}

function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
