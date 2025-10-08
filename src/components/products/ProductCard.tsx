// Componente visual reutilizable para mostrar una TARJETA de producto
// Se usa dentro del listado (catálogo) y muestra imagen, nombre, precio, etc.
// NO crea rutas ni páginas, solo es una pieza visual.



'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
import { getSafeImage } from '@/utils/imageUtils';
import { StarIcon } from '@heroicons/react/24/solid';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  producto: Producto;
}

const ProductCard = ({ producto }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir la navegación al hacer clic en el botón
    e.stopPropagation(); // Prevenir que el evento se propague al Link
    addToCart(producto);
    alert(`${producto.nombre} ha sido agregado al pedido.`);
  };

  const normalizeSupabaseImageUrl = (url: string) => {
    if (!url) return '';
    // Eliminar duplicaciones del segmento product-images/
    let fixed = url.replace(/\/product-images\/(?:product-images\/)+/g, '/product-images/');
    // Quitar espacios accidentales
    fixed = fixed.trim();
    return fixed;
  };

  const getImageUrl = () => {
    // Fallback local inmediato si hubo error o no hay imagen
    if (imageError) {
      return '/placeholder.jpg';
    }
    return getSafeImage(producto.imagen_principal);
  };

  return (
    <Link prefetch={false} href={`/productos/${producto.id}`} className="block group relative h-96 w-full overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1">
      {/* Imagen de Fondo con Efectos */}
      <Image
        src={getImageUrl()}
        alt={producto.nombre}
        fill
        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:blur-sm"
        onError={handleImageError}
        priority={producto.destacado}
      />

      {/* Efectos de brillo y partículas */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
      <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />

      {/* Capa de Degradado Dinámico */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-purple-900/80 group-hover:via-blue-900/40 transition-all duration-500" />

      {/* Contenido de la Tarjeta */}
      <div className="relative flex h-full flex-col items-start justify-between p-6 text-white">
        {/* Sección Superior: Categoría y Destacado */}
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-200 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            {producto.categoria || 'Nuevo'}
          </span>
          {producto.destacado && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
              <StarIcon className="w-4 h-4" />
              <span>Estrella</span>
            </div>
          )}
        </div>

        {/* Sección Inferior: Título, Precio y Botón */}
        <div className="w-full transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-105">
          <h3 className="text-2xl font-bold leading-tight mb-2 drop-shadow-lg group-hover:text-yellow-300 transition-colors duration-300">
            {producto.nombre}
          </h3>
          <p className="text-2xl font-bold text-green-400 mb-4 drop-shadow-lg">
            ${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={producto.stock === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
          >
            {producto.stock > 0 ? '✨ Agregar al pedido' : '❌ Sin stock'}
          </button>
        </div>
      </div>

      {/* Efecto de borde brillante */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
    </Link>
  );
};

export default ProductCard;
