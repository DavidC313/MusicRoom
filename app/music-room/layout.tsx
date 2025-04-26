import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'Music Room - MusicRoom',
  description: 'Join a music room and listen to music together',
};

export default function MusicRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 