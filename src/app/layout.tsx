
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { TutorialProvider } from '@/components/tutorial/tutorial-provider';
import { inter, spaceGrotesk, sourceCodePro } from './fonts';
import { Analytics } from '@vercel/analytics/next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'KYNEX.dev - AI Agent Development Platform',
  description: 'Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development. Build powerful AI workflows with our intuitive visual editor.',
  keywords: 'AI agents, artificial intelligence, automation, workflow, chatbots, deployment, KYNEX, KYNEX.dev',
  authors: [{ name: 'KYNEX.dev Team' }],
  creator: 'KYNEX.dev',
  publisher: 'KYNEX.dev',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/images/logo.png', sizes: '16x16 32x32', type: 'image/png' },
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/logo.png', sizes: '152x152', type: 'image/png' },
      { url: '/images/logo.png', sizes: '120x120', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'KYNEX.dev - AI Agent Development Platform',
    description: 'Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development.',
    url: 'https://kynex.dev',
    siteName: 'KYNEX.dev',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'KYNEX.dev - AI Agent Development Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KYNEX.dev - AI Agent Development Platform',
    description: 'Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development.',
    images: ['/images/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Adobe Fonts - Replace 'your-kit-id' with your actual Adobe Fonts project ID */}
        <link rel="stylesheet" href="https://use.typekit.net/your-kit-id.css" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TutorialProvider>
            {children}
          </TutorialProvider>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster />
        <Analytics />
      </body>
    </html>
  );
}
