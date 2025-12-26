import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '網球平台 - 找球友、訂場地、學網球',
  description: '台灣最大的網球社群平台，提供球友配對、場地預訂、教練服務等功能',
  keywords: '網球, 球友, 場地, 教練, 配對, 預訂',
  authors: [{ name: '網球平台團隊' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: '網球平台 - 找球友、訂場地、學網球',
    description: '台灣最大的網球社群平台，提供球友配對、場地預訂、教練服務等功能',
    type: 'website',
    locale: 'zh_TW',
    siteName: '網球平台',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}