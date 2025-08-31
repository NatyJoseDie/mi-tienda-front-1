'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleLogout = () => {
    logout();
  };

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
          <nav className="hidden md:flex md:space-x-8 items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Inicio</Link>
            <Link href="/catalogo" className="text-gray-500 hover:text-gray-900 transition-colors">Catálogo</Link>
            <Link href="/paquetes" className="text-gray-500 hover:text-gray-900 transition-colors">Planes</Link>
            <Link href="/registro-revendedor" className="text-gray-500 hover:text-gray-900 transition-colors">Convertite en Revendedor</Link>
            <Link href="/solicitar-codigo" className="text-gray-500 hover:text-gray-900 transition-colors">Solicitar Código</Link>
            <Link href="/contacto" className="text-gray-500 hover:text-gray-900 transition-colors">Contacto</Link>
            
            {/* Mostrar información del usuario si está autenticado */}
            {isClient && isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiUser className="h-4 w-4" />
                  <span className="font-medium">{user.nombre} {user.apellido}</span>
                  <span className="text-sm text-gray-500">({user.tipo})</span>
                </div>
                <Link 
                  href={user.tipo === 'admin' ? '/admin' : '/admin/revendedores'} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">Iniciar Sesión</Link>
                <Link href="/acceso" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Registro</Link>
              </div>
            )}
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
