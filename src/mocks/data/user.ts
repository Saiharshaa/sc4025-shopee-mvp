import type { User } from '../../types'

// Do not import this file directly — use the accessors in src/mocks/index.ts.
// Fictional demo shopper: Rashmi, the primary persona in the report (Section 1.5).

export const USER: User = {
  id: 'u001',
  name: 'Rashmi Rao',
  email: 'rashmi.rao@example.com',
  phone: '+91 90000 12345',
  defaultAddress: {
    recipient: 'Rashmi Rao',
    phone: '+91 90000 12345',
    line1: 'Flat 302, Lakeview Residency',
    line2: '27th Main Road, HSR Layout Sector 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
  },
  memberSince: '2024-06-12',
}

/** Starting Shopee Coins balance (1 coin = Rs 1). */
export const INITIAL_COIN_BALANCE = 350

/** When the starting balance expires (it was credited before the fixtures' orders). */
export const INITIAL_COINS_EXPIRE_AT = '2027-03-31T23:59:59+05:30'
