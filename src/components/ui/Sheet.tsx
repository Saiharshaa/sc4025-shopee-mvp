import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Modal sheet on the native <dialog> (focus trap, Esc to close, backdrop).
 * OWNER: Person 4 (Tech Lead).
 */

interface Props {
  open: boolean
  onClose: () => void
  /** id of the heading inside, for the accessible name. */
  labelledBy: string
  children: ReactNode
}

export default function Sheet({ open, onClose, labelledBy, children }: Props) {
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
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-xl p-0 backdrop:bg-black/50"
    >
      <div className="relative p-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded px-2 text-xl leading-none text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
        {children}
      </div>
    </dialog>
  )
}
