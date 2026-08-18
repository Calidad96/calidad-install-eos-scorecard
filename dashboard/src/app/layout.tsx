import type { Metadata } from 'next';
import { Geist, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Install EOS Scorecard | Calidad',
  description: 'Calidad Install department EOS L10 command center',
  icons: {
    icon: [{ url: '/calidad-logo.png', type: 'image/png' }],
    apple: [{ url: '/calidad-logo.png', type: 'image/png' }],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('install-scorecard-theme');if(!t)t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${display.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/calidad-logo.png" type="image/png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="install-app min-h-full font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
