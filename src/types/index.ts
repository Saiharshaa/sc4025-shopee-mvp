/**
 * Shared types for the whole app.
 * OWNER: Person 4 (Tech Lead). Need a new field? Open a small PR against this
 * file rather than declaring a local copy of a type in your page.
 *
 * Money convention: every amount is a whole number of rupees (integer).
 */

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export type SpeedTier = 'standard' | 'express' | 'same-day'

export type Category =
  | 'electronics'
  | 'mobile-accessories'
  | 'fashion'
  | 'beauty'
  | 'home-living'
  | 'groceries'

export interface Product {
  id: string
  title: string
  description: string
  /** Selling price in whole rupees. */
  price: number
  /** Pre-discount price, for strike-through "deal" display. Absent if not on deal. */
  originalPrice?: number
  imageUrl: string
  /** Seller display name. */
  seller: string
  /** Ships from outside India (cross-border). */
  isImported: boolean
  /** Seller is verified (e.g. Shopee Mall / Preferred). */
  isVerified: boolean
  speedTier: SpeedTier
  /** Estimated days to deliver. 0 = same day. */
  etaDays: number
  /** Average rating, 0–5, one decimal place. */
  rating: number
  category: Category
}

// ---------------------------------------------------------------------------
// Vouchers & coins
// ---------------------------------------------------------------------------

interface VoucherBase {
  /** Unique code, also used as the voucher's id. */
  code: string
  title: string
  /** Minimum pre-voucher subtotal (inclusive). Absent = no minimum. */
  minSpend?: number
  /** ISO 8601 timestamp. */
  expiresAt: string
}

export interface PercentageVoucher extends VoucherBase {
  type: 'percentage'
  /** Whole-number percentage, e.g. 15 means 15% off. */
  percentOff: number
  /** Maximum discount in rupees. */
  maxDiscount: number
}

export interface FixedVoucher extends VoucherBase {
  type: 'fixed'
  /** Flat rupees off. */
  amountOff: number
}

export type Voucher = PercentageVoucher | FixedVoucher

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface CartItem {
  product: Product
  /** Integer ≥ 1. */
  quantity: number
}

export interface Cart {
  items: CartItem[]
}

// ---------------------------------------------------------------------------
// Pricing breakdown (output of calculateOrderTotal in src/lib/pricing.ts)
// ---------------------------------------------------------------------------

export interface PricingRules {
  /** Post-voucher subtotal at or above this ships free (inclusive). */
  freeShippingThreshold: number
  /** Flat order-level shipping fee. Speed tier does not change it. */
  shippingFee: number
  /** Coins can cover at most this % of the post-voucher subtotal. */
  coinCapPercent: number
}

export interface LineItemBreakdown {
  productId: string
  title: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type VoucherIneligibleReason = 'min-spend-not-met'

export interface VoucherBreakdown {
  code: string
  type: Voucher['type']
  eligible: boolean
  ineligibleReason?: VoucherIneligibleReason
  /** Rupees still needed to reach minSpend. 0 when eligible. */
  shortfall: number
  /** Discount before the max cap / subtotal clamp (percentage is already floored). 0 when ineligible. */
  rawDiscount: number
  /** Discount actually applied. */
  discount: number
  /** True when a percentage voucher hit its maxDiscount. */
  capped: boolean
}

export interface ShippingBreakdown {
  baseFee: number
  threshold: number
  waived: boolean
  /** Fee actually charged. */
  fee: number
  /** Rupees more (post-voucher) needed to unlock free shipping. 0 if already free. */
  amountToFreeShipping: number
}

export interface CoinsBreakdown {
  /** What the caller asked to use (after sanitising to a non-negative integer). */
  requested: number
  /** Max coins allowed on this order: floor(coinCapPercent% of post-voucher subtotal). */
  cap: number
  /** Coins actually applied (1 coin = Rs 1). */
  applied: number
  /** True when the request was reduced by the cap. */
  capped: boolean
}

export interface OrderBreakdown {
  lines: LineItemBreakdown[]
  itemCount: number
  subtotal: number
  /** null when no voucher was passed in. */
  voucher: VoucherBreakdown | null
  voucherDiscount: number
  postVoucherSubtotal: number
  shipping: ShippingBreakdown
  coins: CoinsBreakdown
  /** Payable total. Never below zero. */
  total: number
}

// ---------------------------------------------------------------------------
// User & orders
// ---------------------------------------------------------------------------

export interface Address {
  recipient: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  defaultAddress: Address
  /** ISO 8601 date. */
  memberSince: string
}

export type OrderStatus =
  | 'placed'
  | 'packed'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderEvent {
  status: OrderStatus
  /** ISO 8601 timestamp. */
  at: string
  note?: string
}

export interface OrderItem {
  productId: string
  title: string
  imageUrl: string
  unitPrice: number
  quantity: number
  speedTier: SpeedTier
}

/** Flat snapshot of the pricing breakdown at the moment the order was placed. */
export interface OrderPricing {
  subtotal: number
  voucherCode: string | null
  voucherDiscount: number
  shippingFee: number
  coinsUsed: number
  total: number
}

export interface Order {
  id: string
  /** ISO 8601 timestamp. */
  placedAt: string
  status: OrderStatus
  items: OrderItem[]
  pricing: OrderPricing
  shippingAddress: Address
  /** ISO 8601 date. */
  estimatedDelivery: string
  /** Oldest first. The last event's status equals `status`. */
  timeline: OrderEvent[]
}

// ---------------------------------------------------------------------------
// Blinkit inventory (Shopee Global Picks)
// ---------------------------------------------------------------------------

/**
 * A brand-authorised Indian importer. It is the seller of record and owns the
 * stock that sits in Blinkit's dark stores.
 */
export interface Vendor {
  id: string
  /** Display name. Equals `Product.seller` on every product this vendor holds. */
  name: string
  legalName: string
  city: string
  /** Brands that have authorised this importer to sell in India. */
  authorisedBrands: string[]
  /** CDSCO cosmetics import registration certificate (Form COS-2). */
  importRegistration: {
    number: string
    /** ISO 8601 timestamp. */
    validUntil: string
  }
  /** Importer-Exporter Code issued by DGFT. */
  iec: string
  gstin: string
  /** ISO 8601 date the vendor joined Global Picks. */
  onboardedAt: string
}

export interface DarkStore {
  id: string
  name: string
  area: string
  city: string
  /** Typical door-to-door time for shoppers this store serves. */
  avgDeliveryMinutes: number
}

/** Units of one product that one vendor keeps in one dark store. */
export interface StockRecord {
  vendorId: string
  productId: string
  darkStoreId: string
  /** Integer ≥ 0. */
  units: number
  /** ISO 8601 timestamp. */
  lastRestockedAt: string
}

export type StockStatus = 'in-stock' | 'low' | 'out'

export type RegistrationStatus = 'valid' | 'renewal-due' | 'expired'
