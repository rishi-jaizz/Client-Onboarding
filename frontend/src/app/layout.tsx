import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ClientFlow — Onboarding Platform',
  description: 'Streamlined client onboarding with multi-step verification, document management, and real-time progress tracking.',
  keywords: ['client onboarding', 'business registration', 'document verification'],
  openGraph: {
    title: 'ClientFlow — Onboarding Platform',
    description: 'Streamlined client onboarding with multi-step verification',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-950 font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#6366f1', secondary: '#f9fafb' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
