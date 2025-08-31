'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo o Nombre de la Tienda */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors duration-200">
              FerreArt
            </Link>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex md:space-x-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Inicio</Link>
            <Link href="/catalogo" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Catálogo</Link>
            <Link href="/paquetes" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Planes</Link>
            <Link href="/registro-revendedor" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Convertite en Revendedor</Link>
            <Link href="/solicitar-codigo" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Solicitar Código</Link>
            <Link href="/contacto" className="text-gray-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Contacto</Link>
            
            {/* Mostrar información del usuario si está autenticado */}
            {isClient && isAuthenticated && user ? (
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <FiUser className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.nombre} {user.apellido}</span>
                    <span className="text-xs text-gray-500">{user.tipo}</span>
                  </div>
                </div>
                <Link 
                  href={user.tipo === 'admin' ? '/admin' : '/admin/revendedores'} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm"
                >
                  Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm shadow-sm"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm">Iniciar Sesión</Link>
                <Link href="/acceso" className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-200 font-medium text-sm shadow-sm">Registro</Link>
              </div>
            )}
          </nav>

          {/* Carrito de Compras y Menú Móvil */}
          <div className="flex items-center space-x-4">
            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200">
              <FiShoppingCart className="h-6 w-6" />
              {isClient && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-blue-600 text-white text-xs rounded-full font-medium shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Botón de menú móvil */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              href="/catalogo" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            <Link 
              href="/paquetes" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Planes
            </Link>
            <Link 
              href="/registro-revendedor" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Convertite en Revendedor
            </Link>
            <Link 
              href="/solicitar-codigo" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Solicitar Código
            </Link>
            <Link 
              href="/contacto" 
              className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contacto
            </Link>
            
            {/* Sección de autenticación en móvil */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isClient && isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 text-sm text-gray-700 bg-blue-50 rounded-lg font-medium">
                    <div className="font-medium">{user.nombre} {user.apellido}</div>
                    <div className="text-gray-500">({user.tipo})</div>
                  </div>
                  <Link 
                    href={user.tipo === 'admin' ? '/admin' : '/admin/revendedores'} 
                    className="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Panel
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/login" 
                    className="block px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium text-center border border-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/acceso" 
                    className="block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 text-center font-medium shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
