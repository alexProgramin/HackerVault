import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { BinaryOverlay } from '@/components/binary-overlay';
import { LanguageProvider } from '@/contexts/language-context';
import { VaultProvider } from '@/contexts/vault-context';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'HackerVault',
  description: 'Analyze password strength and generate secure passwords.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
        <meta name="application-name" content="HackerVault" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HackerVault" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D0E10" />
      </head>
      <body className="font-code antialiased">
        <VaultProvider>
          <LanguageProvider>
            <BinaryOverlay />
            <div className="relative z-10">
              {children}
            </div>
            <Toaster />
          </LanguageProvider>
        </VaultProvider>
      </body>
    </html>
  );
}
