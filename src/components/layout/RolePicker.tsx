import { useRole } from '../../context/useRole'

/**
 * Start screen: choose to use the prototype as a shopper or as a partner.
 * OWNER: Person 4 (Tech Lead). Shown by Layout until a role is picked; the
 * requested page then opens, so deep links still work.
 */
export default function RolePicker() {
  const { setRole } = useRole()

  return (
    <section className="mx-auto max-w-2xl py-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Shopee Global Picks × Blinkit</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">How do you want to use the prototype?</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole('shopper')}
          className="rounded-xl border-2 border-transparent bg-white p-5 shadow-sm hover:border-brand focus-visible:border-brand"
        >
          <span className="text-3xl" aria-hidden="true">
            🛍️
          </span>
          <span className="mt-2 block text-lg font-bold">Shop as a customer</span>
          <span className="mt-1 block text-sm text-gray-600">
            Find trending Korean beauty, check it's genuine, pay with ShopeePay, track delivery and earn Coins.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRole('partner')}
          className="rounded-xl border-2 border-transparent bg-white p-5 shadow-sm hover:border-brand focus-visible:border-brand"
        >
          <span className="text-3xl" aria-hidden="true">
            🏬
          </span>
          <span className="mt-2 block text-lg font-bold">Partner view</span>
          <span className="mt-1 block text-sm text-gray-600">
            For importers and Blinkit stores: import registrations, stock and days of inventory per dark store.
          </span>
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500">No sign-in needed. Reloading the page starts a fresh session.</p>
    </section>
  )
}
