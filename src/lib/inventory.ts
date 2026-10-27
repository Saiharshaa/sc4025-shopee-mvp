/**
 * Status rules for the Blinkit inventory view.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 *  1. Stock: 0 units is "out", 1..LOW_STOCK_THRESHOLD (inclusive) is "low",
 *     anything above is "in-stock".
 *  2. Import registration: "expired" once validUntil has passed,
 *     "renewal-due" within RENEWAL_WARNING_DAYS of it, otherwise "valid".
 */
import type { RegistrationStatus, StockStatus } from '../types'

export const LOW_STOCK_THRESHOLD = 5
export const RENEWAL_WARNING_DAYS = 90

const DAY_MS = 24 * 60 * 60 * 1000

export function stockStatus(units: number): StockStatus {
  if (units <= 0) return 'out'
  return units <= LOW_STOCK_THRESHOLD ? 'low' : 'in-stock'
}

/** Pass `now` explicitly in tests. */
export function registrationStatus(validUntil: string, now: Date = new Date()): RegistrationStatus {
  const msLeft = Date.parse(validUntil) - now.getTime()
  if (msLeft < 0) return 'expired'
  return msLeft <= RENEWAL_WARNING_DAYS * DAY_MS ? 'renewal-due' : 'valid'
}
