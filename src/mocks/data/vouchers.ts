import type { Voucher } from '../../types'

// Do not import this file directly — use the accessors in src/mocks/index.ts.
// Expiry dates are fixed. MONSOON100 is deliberately already expired so the
// wallet page has an expired voucher to render.

export const VOUCHERS: Voucher[] = [
  {
    code: 'WELCOME50',
    title: 'Rs 50 off your order',
    type: 'fixed',
    amountOff: 50,
    minSpend: 299,
    expiresAt: '2027-03-31T23:59:59+05:30',
  },
  {
    code: 'SAVE10',
    title: '10% off, up to Rs 100',
    type: 'percentage',
    percentOff: 10,
    maxDiscount: 100,
    expiresAt: '2027-03-31T23:59:59+05:30',
  },
  {
    code: 'SAVE15',
    title: '15% off, up to Rs 150',
    type: 'percentage',
    percentOff: 15,
    maxDiscount: 150,
    minSpend: 999,
    expiresAt: '2027-03-31T23:59:59+05:30',
  },
  {
    code: 'DIWALI200',
    title: 'Diwali Sale: Rs 200 off',
    type: 'fixed',
    amountOff: 200,
    minSpend: 1499,
    expiresAt: '2026-12-31T23:59:59+05:30',
  },
  {
    code: 'MEGA25',
    title: '25% off, up to Rs 300',
    type: 'percentage',
    percentOff: 25,
    maxDiscount: 300,
    minSpend: 1999,
    expiresAt: '2027-03-31T23:59:59+05:30',
  },
  {
    code: 'MONSOON100',
    title: 'Monsoon Sale: Rs 100 off',
    type: 'fixed',
    amountOff: 100,
    minSpend: 799,
    expiresAt: '2026-09-30T23:59:59+05:30',
  },
]
