'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo o Nombre de la Tienda */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              FerreArt
            </Link>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex md:space-x-8">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Inicio</Link>
            <Link href="/catalogo" className="text-gray-500 hover:text-gray-900 transition-colors">Catálogo</Link>
            <Link href="/registro-revendedor" className="text-gray-500 hover:text-gray-900 transition-colors">Convertite en Revendedor</Link>
            <Link href="/contacto" className="text-gray-500 hover:text-gray-900 transition-colors">Contacto</Link>
            <Link href="/admin" className="text-blue-600 font-bold hover:underline">Admin</Link>
          </nav>

          {/* Carrito de Compras */}
          <div className="flex items-center">
            <Link href="/carrito" className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <FiShoppingCart className="h-6 w-6" />
              {isClient && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
