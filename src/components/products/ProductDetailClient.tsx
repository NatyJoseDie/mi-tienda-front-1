// Componente visual para mostrar el DETALLE completo de un producto
// Se usa dentro de la página de detalle y muestra galería, descripción, stock, botón agregar al carrito, etc.
// NO crea rutas ni páginas, solo es una pieza visual.



'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Producto;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState(product.imagen_principal || 'https://placehold.co/600x600.png?text=Sin+Imagen');

  const allImages = [product.imagen_principal, ...(product.imagenes || [])].filter(Boolean) as string[];

  const handleAddToCart = () => {
    // Solución 1: No se añade 'quantity' aquí. 
    // La lógica de la cantidad la debe manejar el contexto del carrito.
    addToCart(product);
    alert(`${product.nombre} ha sido añadido al carrito.`);
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  const hasValidPrice = typeof product.precio_final === 'number' && product.precio_final > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Botón Volver al Catálogo */}
      <div className="container mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <Link 
          href="/catalogo" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-all duration-300 hover:scale-105 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Catálogo
        </Link>
      </div>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
            {/* Galería de Imágenes */}
            <div className="space-y-6">
              <div className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
                  <Image
                    src={mainImage}
                    alt={product.nombre}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={`aspect-square cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 ${
                        img === mainImage 
                          ? 'ring-4 ring-indigo-500 shadow-lg' 
                          : 'ring-2 ring-gray-200 hover:ring-indigo-300 shadow-md'
                      }`}
                      onClick={() => setMainImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`${product.nombre} - imagen ${index + 1}`}
                        width={150}
                        height={150}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del Producto */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Header del producto */}
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {product.categoria}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                  {product.nombre}
                </h1>
              </div>

              {/* Precio */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-2">Precio</p>
                <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${(product.precio_final ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Descripción */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{product.descripcion}</p>
              </div>

              {/* Stock */}
              <div className={`p-4 rounded-xl border-2 ${
                product.stock > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-700 font-semibold">
                      En stock ({product.stock} disponibles)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-red-700 font-semibold">Sin stock</p>
                  </div>
                )}
              </div>

              {/* Botón de Agregar al Carrito */}
              <button
                onClick={handleAddToCart}
                disabled={!hasValidPrice || product.stock === 0}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  !hasValidPrice || product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40'
                }`}
              >
                {product.stock === 0 ? '❌ Sin stock' : (hasValidPrice ? '🛒 Agregar al pedido' : '❌ No disponible para compra')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
