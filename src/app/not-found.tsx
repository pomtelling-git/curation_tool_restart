import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, marginBottom: 8 }}>Page not found.</p>
      <Link href="/" style={{ fontSize: 11, textDecoration: 'underline' }}>
        Back to projects
      </Link>
    </div>
  )
}
