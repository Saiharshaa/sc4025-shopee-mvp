/**
 * Status rules for the Blinkit inventory view.
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 *  1. Stock (partner dashboard, US11): 0 units is "out"; otherwise "low" when
 *     days of inventory (units / average daily sales) is below LOW_STOCK_DAYS,
 *     else "in-stock". A line that isn't selling never runs out.
 *     Shopper pages use the plain unit count instead ("Only 3 left nearby" at
 *     or below LOW_STOCK_THRESHOLD units).
 *  2. Import registration: "expired" once validUntil has passed,
 *     "renewal-due" within RENEWAL_WARNING_DAYS of it, otherwise "valid".
 */
import type { RegistrationStatus, StockStatus } from '../types'

export const LOW_STOCK_THRESHOLD = 5
export const LOW_STOCK_DAYS = 7
export const RENEWAL_WARNING_DAYS = 90

const DAY_MS = 24 * 60 * 60 * 1000

/** Days the units last at the current sales rate. Infinity when nothing is selling. */
export function daysOfInventory(units: number, avgDailySales: number): number {
  if (units <= 0) return 0
  return avgDailySales > 0 ? units / avgDailySales : Number.POSITIVE_INFINITY
}

export function stockStatus(units: number, avgDailySales: number): StockStatus {
  if (units <= 0) return 'out'
  return daysOfInventory(units, avgDailySales) < LOW_STOCK_DAYS ? 'low' : 'in-stock'
}

/** Pass `now` explicitly in tests. */
export function registrationStatus(validUntil: string, now: Date = new Date()): RegistrationStatus {
  const msLeft = Date.parse(validUntil) - now.getTime()
  if (msLeft < 0) return 'expired'
  return msLeft <= RENEWAL_WARNING_DAYS * DAY_MS ? 'renewal-due' : 'valid'
}
