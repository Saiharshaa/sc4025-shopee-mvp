import { DEFAULT_PRICING_RULES } from '../../lib/pricing'
import type { PaymentMethod } from '../../types'

/**
 * OWNER: Person 4 (Tech Lead). ShopeePay runs on UPI, so shoppers keep the
 * habit they already have; only ShopeePay earns Coins back (rule 9 in
 * src/lib/pricing.ts).
 */

interface Props {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  /** Coins this order would earn if paid with ShopeePay. */
  shopeePayCoins: number
}

const { shopeePayCashbackPercent, maxCashbackCoins } = DEFAULT_PRICING_RULES

const OPTIONS: { method: PaymentMethod; label: string; detail: string }[] = [
  {
    method: 'shopeepay',
    label: 'ShopeePay (UPI)',
    detail: `Pay from any bank account. Get ${shopeePayCashbackPercent}% back in Shopee Coins, up to ${maxCashbackCoins} per order`,
  },
  { method: 'upi', label: 'Other UPI app', detail: 'Pay with any UPI app. No Coins back' },
  { method: 'cod', label: 'Cash on delivery', detail: 'Pay when it arrives. No Coins back' },
]

export default function PaymentMethodPicker({ selected, onSelect, shopeePayCoins }: Props) {
  return (
    <fieldset className="rounded-lg bg-white p-4 shadow-sm">
      <legend className="sr-only">Payment method</legend>
      <h2 className="font-semibold">Payment method</h2>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((option) => (
          <label
            key={option.method}
            className="flex cursor-pointer items-center gap-3 rounded border border-gray-200 p-3 has-checked:border-brand"
          >
            <input
              type="radio"
              name="payment"
              className="accent-brand"
              checked={selected === option.method}
              onChange={() => onSelect(option.method)}
            />
            <span className="flex-1">
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500">{option.detail}</span>
            </span>
            {option.method === 'shopeepay' && shopeePayCoins > 0 && (
              <span className="whitespace-nowrap text-sm font-medium text-brand">+{shopeePayCoins} Coins</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
