import { useSyncExternalStore } from 'react'
import { getVersion, subscribe } from '../mocks'

/**
 * Re-render when session state in src/mocks changes (an order placed, cashback
 * credited). Call it at the top of any page that shows Coins, orders or stock.
 */
export function useMockData(): void {
  useSyncExternalStore(subscribe, getVersion)
}
