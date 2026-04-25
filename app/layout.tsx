import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const githubPagesUrl =
  repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io/${repositoryName}`
    : undefined
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || githubPagesUrl || vercelUrl || 'https://example.com'
const basePath = isGithubActions && repositoryName ? `/${repositoryName}` : ''
const title = 'ペンギンに会える施設マップ | 世界ペンギンの日'
const description =
  '全国の水族館・動物園でペンギンに会える施設の一覧と地図。世界ペンギンの日を記念して、お近くのペンギンスポットを探しましょう。'
const ogImage = `${basePath}/placeholder.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  generator: 'v0.app',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: '世界ペンギンの日',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'ペンギンに会える施設マップ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
