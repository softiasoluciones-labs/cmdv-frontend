import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/context/auth-context"
import "./globals.css"

// Configuración con DM Sans - moderna
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans'
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: '--font-roboto-mono'
})

export const metadata: Metadata = {
  title: "MediCare Pro - Sistema de Gestión Hospitalaria",
  description: "Sistema integral de gestión hospitalaria para Guatemala",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${robotoMono.variable}`}>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/*<Analytics />*/}
      </body>
    </html>
  )
}