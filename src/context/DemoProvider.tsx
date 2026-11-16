import { useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_DEMO, DemoContext, type DemoSettings } from './demoContext'

/** OWNER: Person 4 (Tech Lead). Read it anywhere with useDemo(). */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState<DemoSettings>(DEFAULT_DEMO)
  const value = useMemo(
    () => ({ demo, setDemo: (changes: Partial<DemoSettings>) => setDemoState((d) => ({ ...d, ...changes })) }),
    [demo],
  )
  return <DemoContext value={value}>{children}</DemoContext>
}
