import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import BackendWake from '@/components/layout/BackendWake';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Comercia - FerreArt',
  description: 'Descubre un mundo de productos importados premium.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <BackendWake />
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}