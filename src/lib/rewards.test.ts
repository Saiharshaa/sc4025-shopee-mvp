import { describe, expect, it } from 'vitest'
import { coinsExpireAt, nextReward } from './rewards'

describe('nextReward', () => {
  it('aims for the next multiple of 50 (e.g. 360 -> 40 Coins to 400)', () => {
    expect(nextReward(360)).toEqual({ target: 400, remaining: 40, fraction: 0.2 })
  })

  it('on a milestone, the next goal appears straight away', () => {
    expect(nextReward(400)).toEqual({ target: 450, remaining: 50, fraction: 0 })
  })

  it('handles zero and fractional balances', () => {
    expect(nextReward(0)).toMatchObject({ target: 50, remaining: 50 })
    expect(nextReward(49.9)).toMatchObject({ target: 50, remaining: 1 })
  })
})

describe('coinsExpireAt', () => {
  it('is 6 months after crediting', () => {
    expect(coinsExpireAt('2026-11-16T06:30:00.000Z')).toBe('2027-05-16T06:30:00.000Z')
  })
})
