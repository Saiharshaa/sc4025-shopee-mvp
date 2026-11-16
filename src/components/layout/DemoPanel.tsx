import { useState } from 'react'
import { useDemo } from '../../context/useDemo'

/**
 * Floating "Demo controls" for testers and the video: switch on unhappy paths
 * without editing code. OWNER: Person 4 (Tech Lead). Shown to shoppers only.
 */
export default function DemoPanel() {
  const { demo, setDemo } = useDemo()
  const [open, setOpen] = useState(false)
  const active = demo.failNextPayment

  return (
    <div className="fixed bottom-16 left-3 z-30 sm:bottom-4">
      {open && (
        <div id="demo-controls" className="mb-2 w-64 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
          <p className="font-semibold">Demo controls</p>
          <p className="text-xs text-gray-500">For testing unhappy paths. Not part of the product.</p>
          <label className="mt-3 flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 accent-brand"
              checked={demo.failNextPayment}
              onChange={(e) => setDemo({ failNextPayment: e.target.checked })}
            />
            <span>
              Make the next payment fail
              <span className="block text-xs text-gray-500">ShopeePay or UPI. Switches off after one failure.</span>
            </span>
          </label>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="demo-controls"
        onClick={() => setOpen(!open)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-md ${
          active ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-white'
        }`}
      >
        ⚙ Demo{active && ' · on'}
      </button>
    </div>
  )
}
