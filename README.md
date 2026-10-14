# Shopee India MVP (SC4025)

A frontend-only prototype of a Shopee India shopping experience, built for NTU
SC4025. The project is graded on design rationale and UX validation, so there
is **no backend, no database and no auth**. Everything runs in the browser off
typed mock data.

---

## Quick start

Requires **Node 22.22+** (check with `node -v`).

```bash
git clone https://github.com/Saiharshaa/sc4025-shopee-mvp.git
cd sc4025-shopee-mvp
npm install
npm run dev          # http://localhost:5173
```

| Command              | What it does                                     |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Dev server with hot reload                       |
| `npm test`           | Run unit tests once (Vitest)                     |
| `npm run test:watch` | Re-run tests on save                             |
| `npm run build`      | Type-check + production build into `dist/`       |
| `npm run lint`       | Lint with oxlint                                 |
| `npm run typecheck`  | Type-check only                                  |
| `npm run preview`    | Serve the production build locally               |

**Before opening a PR, run:** `npm run build && npm test && npm run lint`

### Deployment

`main` auto-deploys to Vercel. Config is in `vercel.json`; its rewrite rule
makes deep links like `/cart` survive a page reload.

**Live demo:** _URL added after first deploy_

Vercel's free plan only builds commits authored by the repo owner when the
repo is private. So:

- Merges into `main` **do** deploy, because the merge commit is authored by
  Person 4, who merges.
- Teammates' PRs **don't** get Vercel preview links. Check your work locally
  with `npm run dev`, or `npm run build && npm run preview` for the
  production build.

---

## Team & ownership

> Fill in names and GitHub handles in the first table.

| Person   | Role                | Name / GitHub   | Owns                                    |
| -------- | ------------------- | --------------- | --------------------------------------- |
| Person 1 | PM                  | _add_           | Home + deals feed                       |
| Person 2 | Analyst             | _add_           | Listing, search, filters                |
| Person 3 | Designer            | _add_           | Product detail page, design system      |
| Person 4 | Engineer / Tech Lead | @Saiharshaa    | Cart, checkout, pricing engine, shared infrastructure |
| Person 5 | GTM                 | _add_           | Wallet (coins + vouchers), order tracking |

### Routes

| Route          | Page                     | Folder                      | Owner                |
| -------------- | ------------------------ | --------------------------- | -------------------- |
| `/`            | Home + deals feed        | `src/pages/home/`           | Person 1 (PM)        |
| `/products`    | Listing, search, filters | `src/pages/products/`       | Person 2 (Analyst)   |
| `/product/:id` | Product detail           | `src/pages/product-detail/` | Person 3 (Designer)  |
| `/cart`        | Cart                     | `src/pages/cart/`           | Person 4 (Tech Lead) |
| `/checkout`    | Checkout                 | `src/pages/checkout/`       | Person 4 (Tech Lead) |
| `/wallet`      | Coins + vouchers         | `src/pages/wallet/`         | Person 5 (GTM)       |
| `/orders/:id`  | Order tracking           | `src/pages/orders/`         | Person 5 (GTM)       |

### Shared files

| Path                                  | What                                   | Owner                |
| ------------------------------------- | -------------------------------------- | -------------------- |
| `src/types/index.ts`                  | Every shared type                      | Person 4 (Tech Lead) |
| `src/mocks/`                          | Mock data + accessor functions         | Person 4 (Tech Lead) |
| `src/lib/pricing.ts` (+ tests)        | Voucher / coin / shipping engine       | Person 4 (Tech Lead) |
| `src/lib/format.ts`                   | `formatRupees`, `formatDate`           | Person 4 (Tech Lead) |
| `src/context/`                        | Cart state (`useCart`)                 | Person 4 (Tech Lead) |
| `src/App.tsx`, `src/main.tsx`         | Route table, providers                 | Person 4 (Tech Lead) |
| `src/components/layout/`              | Header, nav, page shell                | Person 4 (Person 3 may restyle) |
| `src/components/ui/`, `@theme` in `src/index.css` | Design system + colour tokens | Person 3 (Designer)  |

**Rule: only edit files you own.** If you need something changed in a shared
file (a new field on `Product`, a new route, a new accessor), message
Person 4 or open a **separate, small PR** for just that change. This keeps
merge conflicts close to zero, and the commit history shows who built what.

---

## Git workflow

Our lecturer reads the commit history to check how work was shared out.
Following these steps keeps your work credited to you.

### One-time setup (each person)

```bash
# Use the SAME email that's on your GitHub account, or your commits won't link to you
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

Accept the GitHub collaborator invite before your first push.

### Branches

- Name: **`feature/<name>-<module>`**, e.g. `feature/aditi-home`,
  `feature/rahul-listing`, `feature/mei-product-detail`.
- **One active branch per person.** After your PR is merged you can keep using
  the same branch (merge `main` into it first) or start a new one with the
  same naming pattern.
- **Never commit or push directly to `main`.**

### Day-to-day loop

```bash
git checkout main && git pull                 # start from the latest main
git checkout -b feature/<name>-<module>       # first time only

# ...work, then commit small pieces as you go...
git add src/pages/home/
git commit -m "feat(home): add deals carousel"

git push -u origin feature/<name>-<module>
gh pr create --fill                           # or open the PR on github.com
```

To pick up teammates' merged work: `git fetch origin && git merge origin/main`.

### Commits

- **Small and frequent.** One logical change per commit, and commit at least
  once every working session. A week of work squashed into one commit looks
  like one afternoon of work.
- Message format: `type(scope): summary`, where type is one of `feat`, `fix`,
  `style`, `refactor`, `test`, `docs` or `chore`.
  Example: `fix(wallet): hide expired vouchers`.

### Pull requests

- Every change reaches `main` through a PR, kept small (ideally under ~300
  changed lines).
- **Person 4 reviews and merges.** Person 4's own PRs are reviewed by any
  other teammate.
- The PR template has a checklist: build, tests, lint and a browser check.
- Merge with **"Create a merge commit"**, **not "Squash and merge"**, so every
  individual commit and its author stay visible in history.

---

## Where to add your page

1. **Your file already exists and is routed.** Open your page in
   `src/pages/<your-folder>/` and replace the placeholder. Put page-specific
   components next to it in the same folder.

2. **Get data from `src/mocks` only.** Never import from `src/mocks/data/*`.
   These accessors are the swap point if the data source ever changes:

   | Accessor                  | Returns                                               |
   | ------------------------- | ----------------------------------------------------- |
   | `getProducts()`           | All 22 products (fresh array, safe to sort/filter)    |
   | `getProductById(id)`      | One product, or `undefined`                           |
   | `getCategories()`         | `{ id, label }[]` for the 6 categories                |
   | `getVouchers()`           | All vouchers, including expired ones                  |
   | `getVoucherByCode(code)`  | One voucher (case-insensitive), or `undefined`        |
   | `getCoinBalance()`        | Current Shopee Coins balance                          |
   | `getUser()`               | Demo shopper with default address                     |
   | `getOrders()`             | Orders, newest first                                  |
   | `getOrderById(id)`        | One order, or `undefined`                             |
   | `getCart()` / `placeOrder()` | Used by the cart/checkout. Read the live cart with `useCart()` instead |

   They are synchronous, so there are no loading states to handle.

3. **Types** come from `src/types` (`Product`, `Voucher`, `Order`, …).

4. **Cart:** from any page, `const { cart, addItem, itemCount } = useCart()`
   (`src/context/useCart.ts`). Product detail's "Add to cart" button is just
   `addItem(product, quantity)`.

5. **Money and dates:** `formatRupees(1916)` gives `₹1,916`, and
   `formatDate(iso)` gives `31 Mar 2027` (always in IST). Both are in
   `src/lib/format.ts`.

6. **Discount maths:** use `src/lib/pricing.ts` (`calculateOrderTotal`,
   `evaluateVoucher`, `isVoucherExpired`). Don't re-implement it in a page.

7. **UI components:** Person 3's design system will live in
   `src/components/ui/`. Until then, use Tailwind classes directly. Brand
   colours: `bg-brand`, `text-brand`, `bg-brand-light`, `hover:bg-brand-dark`.

8. **Links:** use `<Link to="/product/p001">` from `react-router`, never
   `<a href>`. A plain anchor does a full page reload, which wipes the cart
   and any placed orders.

9. **Images:** products currently point at per-category placeholders in
   `public/images/`. Drop real images in the same folder and update
   `imageUrl` via a mocks PR.

```tsx
// Example: reading mock data in a page
import { Link } from 'react-router'
import { formatRupees } from '../../lib/format'
import { getProducts } from '../../mocks'

export default function ExamplePage() {
  const products = getProducts().filter((p) => p.isVerified)
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <Link to={`/product/${p.id}`}>
            {p.title}: {formatRupees(p.price)}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

---

## Mock data

- **22 products** across 6 categories. They mix imported and local,
  verified and unverified sellers, and all three speed tiers
  (`standard` / `express` / `same-day`). Products with `originalPrice` are
  on deal.
- **Vouchers:**

  | Code         | Type    | Value                | Min spend | Note             |
  | ------------ | ------- | -------------------- | --------- | ---------------- |
  | `WELCOME50`  | fixed   | ₹50 off              | ₹299      |                  |
  | `SAVE10`     | percent | 10%, max ₹100        | none      |                  |
  | `SAVE15`     | percent | 15%, max ₹150        | ₹999      |                  |
  | `DIWALI200`  | fixed   | ₹200 off             | ₹1,499    | expires 31 Dec 2026 |
  | `MEGA25`     | percent | 25%, max ₹300        | ₹1,999    |                  |
  | `MONSOON100` | fixed   | ₹100 off             | ₹799      | **already expired** |

- **Coins:** 350. **Orders:** `ORD-1001` (delivered), `ORD-1002` (shipped,
  imported), `ORD-1003` (out for delivery). **Cart:** pre-filled with
  3 lines (₹1,916) so checkout can be demoed straight away.
- Placing an order deducts coins and adds an order **in memory only**. A full
  page reload resets everything, which is handy between usability-test
  participants.
- `src/mocks/fixtures.test.ts` checks fixture sanity (unique ids, valid
  ratings, order totals that match the pricing engine). Run `npm test` after
  editing mock data.

---

## Pricing rules (cart & checkout)

Implemented as pure functions in `src/lib/pricing.ts`; `calculateOrderTotal(cart, voucher, coinsToApply)`
returns every intermediate step so the checkout can explain the total.
The team agreed these rules on 2026-10-14:

1. **Subtotal** = sum of price × quantity. All money is **whole rupees**.
2. **At most one voucher** per order.
3. A voucher is eligible when subtotal **≥ min spend** (inclusive).
   Ineligible vouchers give ₹0 and report the shortfall; they don't error.
4. **Percentage vouchers** apply to the subtotal, are **rounded down** to the
   rupee and are capped at their max discount. **Fixed vouchers** take a flat
   amount off. Neither can exceed the subtotal.
5. **Shipping** is a flat **₹40** per order, waived when the
   **post-voucher, pre-coin** subtotal is **≥ ₹499** (inclusive). Speed tier
   doesn't change the fee. An empty cart has no fee.
6. **Coins:** 1 coin = ₹1, capped at **10% of the post-voucher subtotal,
   rounded down**. The engine doesn't know the balance; checkout passes
   `min(balance, wanted)`.
7. **Order of operations:** subtotal → voucher → shipping → coins.
8. The payable total **never goes below ₹0**.

The thresholds live in `DEFAULT_PRICING_RULES`. Worked example (the seeded
cart with `SAVE15` and coins on):

| Step                                  | Amount      |
| ------------------------------------- | ----------- |
| Subtotal                              | ₹1,916      |
| SAVE15: 15% = ₹287, capped at ₹150    | −₹150       |
| Post-voucher subtotal                 | ₹1,766      |
| Shipping (₹1,766 ≥ ₹499)              | Free        |
| Coins: cap = floor(10% × 1,766) = 176 | −₹176       |
| **Total**                             | **₹1,590**  |

---

## Project structure

```
src/
  App.tsx                 route table (Person 4)
  main.tsx                providers: router + cart (Person 4)
  index.css               Tailwind + theme tokens (Person 3)
  types/index.ts          all shared types (Person 4)
  mocks/
    index.ts              accessor functions: import from here (Person 4)
    data/                 raw fixtures (don't import directly)
  lib/
    pricing.ts            discount engine + tests (Person 4)
    format.ts             formatRupees, formatDate (Person 4)
  context/                cart state + useCart() (Person 4)
  components/
    layout/               header, nav, page shell (Person 4)
    ui/                   design system (Person 3)
  pages/
    home/                 Person 1
    products/             Person 2
    product-detail/       Person 3
    cart/ checkout/       Person 4
    wallet/ orders/       Person 5
public/images/            placeholder product art
```

## Stack

Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 4 · React Router 8 · Vitest 5 · oxlint

React Router 8 no longer ships `react-router-dom`. Import everything
(`Link`, `useParams`, `useNavigate`, …) from **`react-router`**.
