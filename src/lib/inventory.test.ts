import { describe, expect, it } from 'vitest'
import { LOW_STOCK_THRESHOLD, RENEWAL_WARNING_DAYS, registrationStatus, stockStatus } from './inventory'

describe('stockStatus', () => {
  it('0 units is out of stock', () => {
    expect(stockStatus(0)).toBe('out')
  })

  it('is low from 1 up to the threshold (inclusive)', () => {
    expect(stockStatus(1)).toBe('low')
    expect(stockStatus(LOW_STOCK_THRESHOLD)).toBe('low')
  })

  it('is in stock above the threshold', () => {
    expect(stockStatus(LOW_STOCK_THRESHOLD + 1)).toBe('in-stock')
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
