import type { DarkStore, StockRecord, Vendor } from '../../types'

// Do not import this file directly — use the accessors in src/mocks/index.ts.
// Global Picks supply side: brand-authorised importers own the stock, Blinkit
// dark stores hold and deliver it. Pilot scope from the roadmap: K-beauty in
// Bengaluru. Importers, brands, registration numbers, IECs and GSTINs are all
// fictional.

export const VENDORS: Vendor[] = [
  {
    id: 'v001',
    name: 'K-Glow Imports',
    legalName: 'K-Glow Imports Pvt. Ltd.',
    city: 'Bengaluru',
    authorisedBrands: ['Haneul', 'Dalbit Lab'],
    importRegistration: { number: 'IMP/COS/2025/001472', validUntil: '2030-03-31T23:59:59+05:30' },
    iec: 'AAKCK4821M',
    gstin: '29AAKCK4821M1Z7',
    onboardedAt: '2026-08-04',
  },
  {
    id: 'v002',
    name: 'Seoul Shelf India',
    legalName: 'Seoul Shelf India LLP',
    city: 'Mumbai',
    authorisedBrands: ['Bomnal', 'Mulgyeol'],
    // Due for renewal soon, so the inventory view has a warning to show.
    importRegistration: { number: 'IMP/COS/2022/000318', validUntil: '2027-01-15T23:59:59+05:30' },
    iec: 'ABRFS7310Q',
    gstin: '27ABRFS7310Q1ZK',
    onboardedAt: '2026-09-15',
  },
]

export const DARK_STORES: DarkStore[] = [
  { id: 'ds-hsr', name: 'Blinkit HSR Layout', area: 'HSR Layout', city: 'Bengaluru', avgDeliveryMinutes: 11, pincodes: ['560102', '560068'] },
  { id: 'ds-kor', name: 'Blinkit Koramangala', area: 'Koramangala', city: 'Bengaluru', avgDeliveryMinutes: 14, pincodes: ['560034', '560095'] },
  { id: 'ds-ind', name: 'Blinkit Indiranagar', area: 'Indiranagar', city: 'Bengaluru', avgDeliveryMinutes: 17, pincodes: ['560038', '560008'] },
]

// Mix of healthy, low (<= 5) and out-of-stock lines so every status shows up.
export const STOCK: StockRecord[] = [
  // K-Glow Imports
  { vendorId: 'v001', productId: 'p023', darkStoreId: 'ds-hsr', units: 24, lastRestockedAt: '2026-10-24T06:30:00+05:30' },
  { vendorId: 'v001', productId: 'p023', darkStoreId: 'ds-kor', units: 18, lastRestockedAt: '2026-10-24T07:10:00+05:30' },
  { vendorId: 'v001', productId: 'p023', darkStoreId: 'ds-ind', units: 4, lastRestockedAt: '2026-10-19T06:45:00+05:30' },
  { vendorId: 'v001', productId: 'p024', darkStoreId: 'ds-hsr', units: 12, lastRestockedAt: '2026-10-24T06:30:00+05:30' },
  { vendorId: 'v001', productId: 'p024', darkStoreId: 'ds-kor', units: 9, lastRestockedAt: '2026-10-24T07:10:00+05:30' },
  { vendorId: 'v001', productId: 'p024', darkStoreId: 'ds-ind', units: 7, lastRestockedAt: '2026-10-19T06:45:00+05:30' },
  { vendorId: 'v001', productId: 'p025', darkStoreId: 'ds-hsr', units: 3, lastRestockedAt: '2026-10-17T06:30:00+05:30' },
  { vendorId: 'v001', productId: 'p025', darkStoreId: 'ds-kor', units: 15, lastRestockedAt: '2026-10-24T07:10:00+05:30' },
  { vendorId: 'v001', productId: 'p025', darkStoreId: 'ds-ind', units: 0, lastRestockedAt: '2026-10-12T06:45:00+05:30' },

  // Seoul Shelf India
  { vendorId: 'v002', productId: 'p026', darkStoreId: 'ds-hsr', units: 20, lastRestockedAt: '2026-10-22T08:00:00+05:30' },
  { vendorId: 'v002', productId: 'p026', darkStoreId: 'ds-kor', units: 0, lastRestockedAt: '2026-10-15T08:20:00+05:30' },
  { vendorId: 'v002', productId: 'p026', darkStoreId: 'ds-ind', units: 11, lastRestockedAt: '2026-10-22T09:00:00+05:30' },
  { vendorId: 'v002', productId: 'p027', darkStoreId: 'ds-hsr', units: 8, lastRestockedAt: '2026-10-22T08:00:00+05:30' },
  { vendorId: 'v002', productId: 'p027', darkStoreId: 'ds-kor', units: 6, lastRestockedAt: '2026-10-22T08:20:00+05:30' },
  { vendorId: 'v002', productId: 'p027', darkStoreId: 'ds-ind', units: 5, lastRestockedAt: '2026-10-22T09:00:00+05:30' },
]
