import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FosterGrid — Rapid Crisis Evacuation Dispatcher',
  description:
    'AI-driven emergency dispatch matching shelter animals to safe foster homes in San Jose.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
