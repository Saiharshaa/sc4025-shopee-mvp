import { Link } from 'react-router'

/** OWNER: Person 4 (Tech Lead). Catch-all for unknown routes. */
export default function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-brand underline">
        Back to home
      </Link>
    </section>
  )
}
