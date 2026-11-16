/**
 * Shopee Coins rewards rules (US9).
 * OWNER: Person 4 (Tech Lead). Pure functions only: no React, no mock data.
 *
 *  1. ShopeePay cashback is credited once the order is delivered
 *     (isOrderDelivered in src/lib/tracking.ts), not at payment.
 *  2. Coins expire COIN_EXPIRY_MONTHS months after they are credited.
 *  3. Next-reward nudge: milestones every REWARD_STEP Coins, so a shopper with
 *     360 Coins sees "40 Coins to ₹400 off" (goal-gradient, Kivetz et al. 2006).
 *     The next goal shows as soon as one is reached.
 */

export const COIN_EXPIRY_MONTHS = 6
export const REWARD_STEP = 50

/** Rule 2. ISO timestamp the Coins credited at `creditedAt` expire. */
export function coinsExpireAt(creditedAt: string): string {
  const d = new Date(creditedAt)
  d.setMonth(d.getMonth() + COIN_EXPIRY_MONTHS)
  return d.toISOString()
}

export interface NextReward {
  /** Balance to reach; worth the same in rupees off (1 Coin = ₹1). */
  target: number
  remaining: number
  /** 0..1 progress from the previous milestone to `target`. */
  fraction: number
}

/** Rule 3. A balance exactly on a milestone aims for the next one. */
export function nextReward(balance: number): NextReward {
  const coins = Math.max(0, Math.floor(balance))
  const target = (Math.floor(coins / REWARD_STEP) + 1) * REWARD_STEP
  return { target, remaining: target - coins, fraction: (coins % REWARD_STEP) / REWARD_STEP }
}
