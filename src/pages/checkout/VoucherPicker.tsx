import { formatDate, formatRupees } from '../../lib/format'
import { evaluateVoucher } from '../../lib/pricing'
import type { Voucher } from '../../types'

/** OWNER: Person 4 (Tech Lead). Single-select: only one voucher per order. */

interface Props {
  vouchers: Voucher[]
  subtotal: number
  selectedCode: string | null
  onSelect: (code: string | null) => void
}

export default function VoucherPicker({ vouchers, subtotal, selectedCode, onSelect }: Props) {
  return (
    <fieldset className="rounded-lg bg-white p-4 shadow-sm">
      <legend className="sr-only">Voucher</legend>
      <h2 className="font-semibold">Shopee Voucher</h2>
      <p className="text-xs text-gray-500">One voucher per order.</p>

      <div className="mt-3 space-y-2">
        <label className="flex cursor-pointer items-center gap-3 rounded border border-gray-200 p-3 has-checked:border-brand">
          <input
            type="radio"
            name="voucher"
            className="accent-brand"
            checked={selectedCode === null}
            onChange={() => onSelect(null)}
          />
          <span className="text-sm">No voucher</span>
        </label>

        {vouchers.map((v) => {
          const result = evaluateVoucher(v, subtotal)
          return (
            <label
              key={v.code}
              className={`flex items-center gap-3 rounded border border-gray-200 p-3 has-checked:border-brand ${
                result.eligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <input
                type="radio"
                name="voucher"
                className="accent-brand"
                disabled={!result.eligible}
                checked={selectedCode === v.code}
                onChange={() => onSelect(v.code)}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">{v.title}</span>
                <span className="block text-xs text-gray-500">
                  {v.code}
                  {v.minSpend ? ` · Min. spend ${formatRupees(v.minSpend)}` : ''} · Valid till{' '}
                  {formatDate(v.expiresAt)}
                </span>
              </span>
              <span className={`text-sm font-medium ${result.eligible ? 'text-brand' : 'text-gray-500'}`}>
                {result.eligible
                  ? `Save ${formatRupees(result.discount)}`
                  : `Spend ${formatRupees(result.shortfall)} more`}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
