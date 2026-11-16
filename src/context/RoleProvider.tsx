import { useMemo, useState, type ReactNode } from 'react'
import { RoleContext, type Role } from './roleContext'

/** OWNER: Person 4 (Tech Lead). Read it anywhere with useRole(). */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const value = useMemo(() => ({ role, setRole }), [role])
  return <RoleContext value={value}>{children}</RoleContext>
}
