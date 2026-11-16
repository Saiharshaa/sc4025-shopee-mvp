import { createContext } from 'react'

/**
 * Switches for demonstrating unhappy paths in usability tests and the video.
 * Held in memory like everything else; a reload turns them off.
 */
export interface DemoSettings {
  /** The next online payment (ShopeePay or UPI) fails, then this switches itself off. US7. */
  failNextPayment: boolean
  /** Minutes added to every Blinkit delivery ETA (0 = on time). US8. */
  delayMinutes: number
}

export interface DemoContextValue {
  demo: DemoSettings
  setDemo: (changes: Partial<DemoSettings>) => void
}

export const DEFAULT_DEMO: DemoSettings = { failNextPayment: false, delayMinutes: 0 }

export const DemoContext = createContext<DemoContextValue | null>(null)
