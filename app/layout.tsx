import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo_Black, Inter_Tight } from 'next/font/google'
import './globals.css'

const archivoBlack = Archivo_Black({
  variable: '--font-archivo-black',
  weight: '400',
  subsets: ['latin'],
})

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TURNOS · Planificador de turnos',
  description:
    'Planifica los turnos de tus locales de ocio nocturno: asigna trabajadores a los días de apertura y gestiona eventos especiales.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4efd8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${archivoBlack.variable} ${interTight.variable} bg-paper`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
