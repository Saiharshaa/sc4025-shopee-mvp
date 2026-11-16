import { createContext } from 'react'

/**
 * Who is using the prototype. There is no real login: the start screen picks
 * a role, held in memory, so a reload starts a fresh session.
 * - shopper: the shopping app (report Section 2.4, five-tab navigation)
 * - partner: the importer / Blinkit store dashboard (US11), a separate view
 */
export type Role = 'shopper' | 'partner'

export interface RoleContextValue {
  role: Role | null
  setRole: (role: Role | null) => void
}

export const RoleContext = createContext<RoleContextValue | null>(null)
