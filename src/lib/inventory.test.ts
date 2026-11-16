import { describe, expect, it } from 'vitest'
import { LOW_STOCK_DAYS, RENEWAL_WARNING_DAYS, daysOfInventory, registrationStatus, stockStatus } from './inventory'

describe('daysOfInventory', () => {
  it('is units divided by average daily sales', () => {
    expect(daysOfInventory(24, 3.5)).toBeCloseTo(6.86, 2)
  })

  it('is 0 when out of stock and infinite when nothing is selling', () => {
    expect(daysOfInventory(0, 2)).toBe(0)
    expect(daysOfInventory(10, 0)).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('stockStatus (US11)', () => {
  it('0 units is out of stock', () => {
    expect(stockStatus(0, 1)).toBe('out')
  })

  it('is low below 7 days of inventory, in stock from 7 days', () => {
    expect(stockStatus(24, 3.5)).toBe('low') // 6.9 days
    expect(stockStatus(LOW_STOCK_DAYS * 2, 2)).toBe('in-stock') // exactly 7 days
    expect(stockStatus(3, 0)).toBe('in-stock') // not selling, never runs out
  })
})

describe('registrationStatus', () => {
  const validUntil = '2027-01-15T23:59:59+05:30'
  const daysBefore = (days: number) => new Date(Date.parse(validUntil) - days * 24 * 60 * 60 * 1000)

  it('is valid more than the warning window before expiry', () => {
    expect(registrationStatus(validUntil, daysBefore(RENEWAL_WARNING_DAYS + 1))).toBe('valid')
  })

  it('is renewal-due inside the warning window (inclusive)', () => {
    expect(registrationStatus(validUntil, daysBefore(RENEWAL_WARNING_DAYS))).toBe('renewal-due')
    expect(registrationStatus(validUntil, new Date('2027-01-15T23:59:00+05:30'))).toBe('renewal-due')
  })

  it('is expired once validUntil has passed', () => {
    expect(registrationStatus(validUntil, new Date('2027-01-16T00:00:00+05:30'))).toBe('expired')
  })
})
