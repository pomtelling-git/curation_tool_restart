import type { Metadata } from 'next'
import { Toast } from '@/components/Toast'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Visual Curator',
  description: 'A visual curation tool for DixonBaxi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toast />
      </body>
    </html>
  )
}
