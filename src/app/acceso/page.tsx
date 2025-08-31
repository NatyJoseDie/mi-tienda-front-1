'use client';

import Link from 'next/link';

export default function AccesoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Registro al Sistema</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Regístrate para acceder a todas las funcionalidades según tu perfil.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Registro Admin */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-blue-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Registro Admin</h2>
            <p className="text-gray-600 mb-6 text-center text-lg">
              Crear cuenta de administrador para gestionar el sistema completo
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-sm text-gray-500 space-y-2">
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Gestión completa de productos</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Control de revendedores</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Configuración del sistema</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Reportes y estadísticas</p>
              </div>
              <Link 
                href="/registro-admin" 
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block text-lg"
              >
                Registrarse como Admin
              </Link>
            </div>
          </div>
          
          {/* Registro Revendedor */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Registro Revendedor</h2>
            <p className="text-gray-600 mb-6 text-center text-lg">
              Únete como revendedor y accede a precios especiales
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-sm text-gray-500 space-y-2">
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Precios mayoristas exclusivos</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Catálogo completo de productos</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Soporte personalizado</p>
                <p className="flex items-center"><span className="text-green-500 mr-2">✓</span> Herramientas de venta</p>
              </div>
              <Link 
                href="/registro-revendedor" 
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block text-lg"
              >
                Registrarse como Revendedor
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">¿Necesitas ayuda?</h3>
            <p className="text-gray-600 mb-4">
              Si tienes dudas sobre qué tipo de cuenta necesitas o problemas para acceder, contáctanos.
            </p>
            <Link 
              href="/contacto" 
              className="inline-block bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}