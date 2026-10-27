import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** OWNER: Person 4 (Tech Lead). A titled, horizontally scrolling row with a "See all" link. */

interface Props {
  id: string
  title: string
  subtitle?: string
  seeAllTo?: string
  children: ReactNode
}

export default function Shelf({ id, title, subtitle, seeAllTo, children }: Props) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={id} className="text-lg font-bold">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {seeAllTo && (
          <Link to={seeAllTo} className="flex-none text-sm font-medium text-brand hover:underline">
            See all <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <ul className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">{children}</ul>
    </section>
  )
}
