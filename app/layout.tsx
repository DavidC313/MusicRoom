import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'MusicRoom',
  description: 'Listen to music together with friends',
  icons: {
    icon: [
      { url: '/musicroom.ico', sizes: 'any' },
      { url: '/musicroom.ico', type: 'image/x-icon' }
    ],
    shortcut: '/musicroom.ico',
    apple: '/musicroom.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/musicroom.ico',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/musicroom.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/musicroom.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
