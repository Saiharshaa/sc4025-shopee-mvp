import { useEffect, useRef } from 'react'
import { formatRupees } from '../../lib/format'

/**
 * OWNER: Person 4 (Tech Lead). US7: one confirmation completes a ShopeePay
 * payment. Shows the exact amount from checkout (no fee added after Pay, US6),
 * the linked UPI account and the Coins to be earned. Payment is simulated.
 */

interface Props {
  open: boolean
  processing: boolean
  amount: number
  coinsEarned: number
  upiId: string
  onConfirm: () => void
  onCancel: () => void
}

export default function PayConfirmSheet({ open, processing, amount, coinsEarned, upiId, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="pay-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!processing) onCancel()
      }}
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-xl p-0 backdrop:bg-black/50"
    >
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">ShopeePay · UPI</p>
        <h2 id="pay-title" className="mt-1 text-2xl font-bold">
          Pay {formatRupees(amount)}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          From <span className="font-mono">{upiId}</span> (HDFC Bank ••4821)
        </p>
        {coinsEarned > 0 && (
          <p className="mt-3 rounded bg-brand-light p-2 text-sm text-brand-dark">
            🪙 You'll earn <strong>{coinsEarned} Shopee Coins</strong>, credited once it's delivered
          </p>
        )}
        <p className="mt-3 text-xs text-gray-500">This is the full amount. Nothing is added after you confirm.</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 rounded border border-gray-300 py-2.5 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            className="flex-[2] rounded bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
          >
            {processing ? 'Processing…' : 'Confirm and pay'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
