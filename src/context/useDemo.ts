import { useContext } from 'react'
import { DemoContext, type DemoContextValue } from './demoContext'

/** const { demo, setDemo } = useDemo() */
export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>')
  return ctx
}
