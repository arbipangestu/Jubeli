import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jubeli - Jual Beli Kendaraan',
  description: 'Marketplace jual beli mobil dan motor terpercaya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm p-4 mb-6">
             <div className="max-w-7xl mx-auto flex justify-between items-center">
                <a href="/search" className="text-2xl font-bold text-blue-600">Jubeli</a>
                <div className="space-x-4">
                  <a href="/search" className="text-gray-600 hover:text-blue-600">Cari Kendaraan</a>
                  {/* Link dummy untuk demo */}
                  <span className="text-gray-400">|</span>
                  <a href="#" className="text-gray-600 hover:text-blue-600">Login</a>
                </div>
             </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
