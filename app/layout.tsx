import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Claro - AI Window Analysis",
  description: "Advanced window analysis and configuration platform powered by AI",
  generator: "Claro v2.1.0",
  keywords: ["windows", "AI", "analysis", "configuration", "smart home"],
  authors: [{ name: "Claro Team" }],
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#8BD3DD" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">{children}</body>
    </html>
  )
}
