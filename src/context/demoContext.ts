import { createContext } from 'react'

/**
 * Switches for demonstrating unhappy paths in usability tests and the video.
 * Held in memory like everything else; a reload turns them off.
 */
export interface DemoSettings {
  /** The next online payment (ShopeePay or UPI) fails, then this switches itself off. US7. */
  failNextPayment: boolean
}

export interface DemoContextValue {
  demo: DemoSettings
  setDemo: (changes: Partial<DemoSettings>) => void
}

export const DEFAULT_DEMO: DemoSettings = { failNextPayment: false }

export const DemoContext = createContext<DemoContextValue | null>(null)
