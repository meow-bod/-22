import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'

import AppWrapper from './AppWrapper';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Pawdner - 寵物保姆媒合平台',
  description: '專業的寵物保姆媒合平台，為您的毛小孩找到最適合的照護服務',
  keywords: '寵物保姆, 寵物照護, 寵物服務, 毛小孩, 寵物媒合',
  authors: [{ name: 'Pawdner Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Pawdner - 寵物保姆媒合平台',
    description: '專業的寵物保姆媒合平台，為您的毛小孩找到最適合的照護服務',
    type: 'website',
    locale: 'zh_TW'
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFA726', // 我們的主色調
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-TW'>

      <body className={`${nunito.variable} font-sans antialiased bg-background-subtle flex flex-col min-h-screen text-text-main`}>
        <AppWrapper>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AppWrapper>
      </body>
    </html>
  )
}
