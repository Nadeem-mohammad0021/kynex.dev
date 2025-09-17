import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-code',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'monospace'],
});
