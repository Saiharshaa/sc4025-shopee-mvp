import { useState } from 'react'
import { Link } from 'react-router'
import { formatDate, formatDateTime, formatRupees } from '../../lib/format'
import { DEFAULT_PRICING_RULES, isVoucherExpired } from '../../lib/pricing'
import { getCoinBalance, getOrders, getVouchers } from '../../mocks'
import type { Voucher } from '../../types'

/**
 * Route:  /wallet
 * OWNER:  Person 4 (Tech Lead)
 * Scope:  The "Rewards" stage: Shopee Coins balance, how Coins are earned
 *         (ShopeePay cashback, rule 9) and spent (rule 6), Coins activity
 *         from orders, and vouchers (available and expired).
 */

const DAY_MS = 24 * 60 * 60 * 1000
const { shopeePayCashbackPercent, maxCashbackCoins, coinCapPercent } = DEFAULT_PRICING_RULES

export default function WalletPage() {
  const [now] = useState(() => new Date())
  const balance = getCoinBalance()

  const activity = getOrders().flatMap((o) => [
    ...(o.pricing.coinsEarned > 0 ? [{ key: `${o.id}-in`, orderId: o.id, at: o.placedAt, coins: o.pricing.coinsEarned, label: 'ShopeePay cashback' }] : []),
    ...(o.pricing.coinsUsed > 0 ? [{ key: `${o.id}-out`, orderId: o.id, at: o.placedAt, coins: -o.pricing.coinsUsed, label: 'Used at checkout' }] : []),
  ])

  const vouchers = getVouchers().sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt))
  const available = vouchers.filter((v) => !isVoucherExpired(v, now))
  const expired = vouchers.filter((v) => isVoucherExpired(v, now))

  return (
    <section>
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg bg-linear-to-br from-brand to-brand-dark p-5 text-white">
          <p className="text-sm opacity-90">Shopee Coins</p>
          <p className="mt-1 text-4xl font-bold">
            <span aria-hidden="true">🪙</span> {balance}
          </p>
          <p className="mt-1 text-sm opacity-90">Worth {formatRupees(balance)} off your next orders · 1 Coin = ₹1</p>
          <Link to="/products?blinkit=1" className="mt-4 inline-block rounded bg-white px-3 py-1.5 text-sm font-semibold text-brand">
            Shop Global Picks
          </Link>
        </div>

        <div className="rounded-lg bg-white p-4 text-sm shadow-sm">
          <h2 className="font-semibold">How Coins work</h2>
          <ul className="mt-2 space-y-2 text-gray-700">
            <li>
              <strong>Earn</strong>: pay with ShopeePay (UPI) and get {shopeePayCashbackPercent}% of what you pay back as Coins, up
              to {maxCashbackCoins} per order.
            </li>
            <li>
              <strong>Spend</strong>: tick "Use Shopee Coins" at checkout to cover up to {coinCapPercent}% of an order after
              vouchers.
            </li>
            <li>
              <strong>Stack</strong>: Coins work alongside one voucher per order.
            </li>
          </ul>
          <Link to="/orders" className="mt-3 inline-block font-medium text-brand hover:underline">
            Your orders →
          </Link>
        </div>
      </div>

      <section aria-labelledby="activity" className="mt-6 rounded-lg bg-white p-4 shadow-sm">
        <h2 id="activity" className="font-semibold">
          Coins activity
        </h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No Coins earned or used yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100 text-sm">
            {activity.map((a) => (
              <li key={a.key} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block">{a.label}</span>
                  <span className="block text-xs text-gray-500">
                    <Link to={`/orders/${a.orderId}`} className="hover:text-brand">
                      {a.orderId}
                    </Link>{' '}
                    · {formatDateTime(a.at)}
                  </span>
                </span>
                <span className={`flex-none font-semibold ${a.coins > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {a.coins > 0 ? `+${a.coins}` : `−${-a.coins}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="vouchers" className="mt-6">
        <h2 id="vouchers" className="text-lg font-bold">
          Vouchers <span className="text-sm font-normal text-gray-500">({available.length} available)</span>
        </h2>
        <p className="text-sm text-gray-500">One per order. Checkout applies the one that saves you the most; you can change it.</p>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {available.map((v) => (
            <VoucherTile key={v.code} voucher={v} daysLeft={Math.ceil((Date.parse(v.expiresAt) - now.getTime()) / DAY_MS)} />
          ))}
        </ul>

        {expired.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold text-gray-500">Expired</h3>
            <ul className="mt-2 grid grid-cols-1 gap-3 opacity-60 sm:grid-cols-2">
              {expired.map((v) => (
                <VoucherTile key={v.code} voucher={v} />
              ))}
            </ul>
          </>
        )}
      </section>
    </section>
  )
}

function VoucherTile({ voucher, daysLeft }: { voucher: Voucher; daysLeft?: number }) {
  const value = voucher.type === 'fixed' ? formatRupees(voucher.amountOff) : `${voucher.percentOff}%`
  return (
    <li className="flex overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex w-20 flex-none items-center justify-center bg-brand-light text-lg font-bold text-brand">{value}</div>
      <div className="min-w-0 flex-1 p-3 text-sm">
        <p className="font-semibold">{voucher.title}</p>
        <p className="text-xs text-gray-500">
          {voucher.minSpend ? `Min. spend ${formatRupees(voucher.minSpend)}` : 'No min. spend'}
          {voucher.type === 'percentage' && ` · up to ${formatRupees(voucher.maxDiscount)} off`}
        </p>
        <p className="mt-1 flex flex-wrap justify-between gap-x-2 text-xs">
          <span className="font-mono text-brand">{voucher.code}</span>
          {daysLeft === undefined ? (
            <span className="text-gray-500">Expired {formatDate(voucher.expiresAt)}</span>
          ) : (
            <span className={daysLeft <= 7 ? 'font-medium text-amber-700' : 'text-gray-500'}>
              {daysLeft <= 7 ? `Expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : `Valid till ${formatDate(voucher.expiresAt)}`}
            </span>
          )}
        </p>
      </div>
    </li>
  )
}
