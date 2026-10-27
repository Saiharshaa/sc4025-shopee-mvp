# src/components/ui/: design system

Shared UI primitives used by more than one page. Prefer these over a local
copy in your page folder. Components here are presentational: pages fetch
data from `src/mocks` and pass it in as props.

| Component          | Use for                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `ProductCard`      | Product tile in grids and shelves (price, deal %, badges, ETA). Pass `availability` from `getBlinkitAvailability(id)` to show the "⚡ 11 min" Blinkit badge. |

Brand colours are the `@theme` tokens in `src/index.css`: `bg-brand`,
`text-brand`, `bg-brand-light`, `hover:bg-brand-dark`.
