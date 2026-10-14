/** Shared display helpers. OWNER: Person 4 (Tech Lead). */

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** 1916 -> "₹1,916", 150000 -> "₹1,50,000" (Indian digit grouping). */
export function formatRupees(amount: number): string {
  return rupees.format(amount)
}

// Always show dates in IST: a voucher expiring "31 Mar 23:59 IST" must not
// render as 1 Apr on a laptop set to Singapore time.
const istDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

/** "2027-03-31T23:59:59+05:30" -> "31 Mar 2027" (in IST, whatever the device timezone). */
export function formatDate(iso: string): string {
  return istDate.format(new Date(iso))
}
