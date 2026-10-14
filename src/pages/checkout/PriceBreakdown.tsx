import type { ReactNode } from 'react'
import { formatRupees } from '../../lib/format'
import { DEFAULT_PRICING_RULES } from '../../lib/pricing'
import type { OrderBreakdown } from '../../types'

/**
 * OWNER: Person 4 (Tech Lead).
 * Shows every step of calculateOrderTotal() in order, each with a one-line
 * explanation, so the shopper can see exactly how the total was built up.
 */
export default function PriceBreakdown({ breakdown }: { breakdown: OrderBreakdown }) {
  const { voucher, shipping, coins } = breakdown
  const savings = breakdown.voucherDiscount + coins.applied + (breakdown.lines.length > 0 && shipping.waived ? shipping.baseFee : 0)

  return (
    <div>
      <h2 className="font-semibold">Payment details</h2>
      <dl className="mt-3 space-y-3 text-sm">
        <Row label={`Merchandise subtotal (${breakdown.itemCount} items)`} value={formatRupees(breakdown.subtotal)} />

        {voucher && (
          <Row
            label={`Voucher ${voucher.code}`}
            value={`−${formatRupees(voucher.discount)}`}
            valueClass="text-brand"
            note={
              !voucher.eligible
                ? `Not applied: spend ${formatRupees(voucher.shortfall)} more`
                : voucher.capped
                  ? `${formatRupees(voucher.rawDiscount)} off, capped at ${formatRupees(voucher.discount)}`
                  : undefined
            }
          />
        )}

        <Row
          label="Shipping fee"
          value={
            shipping.waived ? (
              <>
                <s className="mr-1 text-gray-400">{formatRupees(shipping.baseFee)}</s>
                <span className="text-green-700">Free</span>
              </>
            ) : (
              formatRupees(shipping.fee)
            )
          }
          note={
            shipping.waived
              ? `Orders of ${formatRupees(shipping.threshold)}+ after vouchers ship free`
              : `Add ${formatRupees(shipping.amountToFreeShipping)} more (after vouchers) for free shipping`
          }
        />

        {coins.requested > 0 && (
          <Row
            label={`Shopee Coins (${coins.applied})`}
            value={`−${formatRupees(coins.applied)}`}
            valueClass="text-brand"
            note={`Up to ${DEFAULT_PRICING_RULES.coinCapPercent}% of ${formatRupees(breakdown.postVoucherSubtotal)} after vouchers (max ${coins.cap} coins)`}
          />
        )}

        <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
          <dt className="font-semibold">Total payment</dt>
          <dd className="text-xl font-bold text-brand">{formatRupees(breakdown.total)}</dd>
        </div>
      </dl>
      {savings > 0 && <p className="mt-1 text-right text-xs text-green-700">You save {formatRupees(savings)}</p>}
    </div>
  )
}

function Row({ label, value, note, valueClass = '' }: { label: string; value: ReactNode; note?: string; valueClass?: string }) {
  return (
    <div>
      <div className="flex justify-between gap-4">
        <dt>{label}</dt>
        <dd className={valueClass}>{value}</dd>
      </div>
      {note && <p className="text-xs text-gray-500">{note}</p>}
    </div>
  )
}
