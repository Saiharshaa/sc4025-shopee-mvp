import { useEffect } from 'react'
import { useDemo } from '../context/useDemo'
import { isOrderDelivered } from '../lib/tracking'
import { creditCashback, getDarkStores, getOrders } from '../mocks'

/**
 * Stands in for a back-end job (US9): right away and then every 15 s, credit
 * the ShopeePay cashback of any order that has now been delivered. Pages that
 * show Coins re-render through useMockData.
 */
export function useCashbackCrediting(): void {
  const { demo } = useDemo()

  useEffect(() => {
    function tick() {
      const now = new Date()
      const stores = getDarkStores()
      for (const order of getOrders()) {
        if (isOrderDelivered(order, stores, now, demo.delayMinutes)) creditCashback(order.id, now)
      }
    }
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 15_000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [demo.delayMinutes])
}
