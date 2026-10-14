import type { Order } from '../../types'
import { USER } from './user'

// Do not import this file directly — use getOrders()/getOrderById() in src/mocks/index.ts.
// Pricing figures follow the rules in src/lib/pricing.ts; a test checks they
// stay consistent with the engine.

export const ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    placedAt: '2026-09-20T19:42:00+05:30',
    status: 'delivered',
    items: [
      {
        productId: 'p016',
        title: 'Stainless Steel Pressure Cooker, 3L',
        imageUrl: '/images/home-living.svg',
        unitPrice: 1349,
        quantity: 1,
        speedTier: 'standard',
      },
      {
        productId: 'p021',
        title: 'Masala Chai Blend, 250g',
        imageUrl: '/images/groceries.svg',
        unitPrice: 219,
        quantity: 2,
        speedTier: 'express',
      },
    ],
    // 1787 -> SAVE15 (15% = 268, capped at 150) -> 1637, free shipping -> 100 coins (cap 163)
    pricing: {
      subtotal: 1787,
      voucherCode: 'SAVE15',
      voucherDiscount: 150,
      shippingFee: 0,
      coinsUsed: 100,
      total: 1537,
    },
    shippingAddress: USER.defaultAddress,
    estimatedDelivery: '2026-09-24',
    timeline: [
      { status: 'placed', at: '2026-09-20T19:42:00+05:30' },
      { status: 'packed', at: '2026-09-21T10:15:00+05:30' },
      { status: 'shipped', at: '2026-09-21T18:30:00+05:30', note: 'Handed to Ekart Logistics' },
      { status: 'out-for-delivery', at: '2026-09-24T08:05:00+05:30' },
      { status: 'delivered', at: '2026-09-24T13:47:00+05:30', note: 'Received by resident' },
    ],
  },
  {
    id: 'ORD-1002',
    placedAt: '2026-10-08T21:10:00+05:30',
    status: 'shipped',
    items: [
      {
        productId: 'p014',
        title: 'Korean Sheet Mask Set (10 pcs)',
        imageUrl: '/images/beauty.svg',
        unitPrice: 599,
        quantity: 1,
        speedTier: 'standard',
      },
      {
        productId: 'p012',
        title: 'Oversized Graphic Tee, K-Street Style',
        imageUrl: '/images/fashion.svg',
        unitPrice: 349,
        quantity: 1,
        speedTier: 'standard',
      },
    ],
    // 948 -> WELCOME50 -> 898, free shipping, no coins
    pricing: {
      subtotal: 948,
      voucherCode: 'WELCOME50',
      voucherDiscount: 50,
      shippingFee: 0,
      coinsUsed: 0,
      total: 898,
    },
    shippingAddress: USER.defaultAddress,
    estimatedDelivery: '2026-10-22',
    timeline: [
      { status: 'placed', at: '2026-10-08T21:10:00+05:30' },
      { status: 'packed', at: '2026-10-09T14:00:00+05:30', note: 'Packed at overseas warehouse' },
      { status: 'shipped', at: '2026-10-11T09:20:00+05:30', note: 'In transit to India (cross-border)' },
    ],
  },
  {
    id: 'ORD-1003',
    placedAt: '2026-10-13T22:05:00+05:30',
    status: 'out-for-delivery',
    items: [
      {
        productId: 'p007',
        title: 'Tempered Glass Screen Guard (Pack of 2)',
        imageUrl: '/images/mobile-accessories.svg',
        unitPrice: 149,
        quantity: 1,
        speedTier: 'same-day',
      },
      {
        productId: 'p015',
        title: 'Smudge-proof Kajal Pencil (Pack of 2)',
        imageUrl: '/images/beauty.svg',
        unitPrice: 179,
        quantity: 1,
        speedTier: 'same-day',
      },
    ],
    // 328, no voucher, below threshold -> Rs 40 shipping -> 20 coins (cap 32)
    pricing: {
      subtotal: 328,
      voucherCode: null,
      voucherDiscount: 0,
      shippingFee: 40,
      coinsUsed: 20,
      total: 348,
    },
    shippingAddress: USER.defaultAddress,
    estimatedDelivery: '2026-10-14',
    timeline: [
      { status: 'placed', at: '2026-10-13T22:05:00+05:30' },
      { status: 'packed', at: '2026-10-14T07:30:00+05:30' },
      { status: 'shipped', at: '2026-10-14T09:10:00+05:30' },
      { status: 'out-for-delivery', at: '2026-10-14T11:45:00+05:30', note: 'Arriving today by 6 PM' },
    ],
  },
]
