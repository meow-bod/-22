import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AppWrapper from './AppWrapper';
import Header from '@/components/ui/Header'; // 匯入 Header 元件
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Pawdner - 寵物保姆媒合平台',
  description: '專業的寵物保姆媒合平台，為您的毛小孩找到最適合的照護服務',
  keywords: '寵物保姆, 寵物照護, 寵物服務, 毛小孩, 寵物媒合',
  authors: [{ name: 'Pawdner Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Pawdner - 寵物保姆媒合平台',
    description: '專業的寵物保姆媒合平台，為您的毛小孩找到最適合的照護服務',
    type: 'website',
    locale: 'zh_TW'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-TW'>
      <head>
        <meta name='theme-color' content='#3B82F6' />
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={`${inter.variable} antialiased bg-background-subtle`}>
        <AppWrapper>
          <Header />
          <main>{children}</main>
        </AppWrapper>
      </body>
    </html>
  )
}
