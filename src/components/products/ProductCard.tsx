// Componente visual reutilizable para mostrar una TARJETA de producto
// Se usa dentro del listado (catálogo) y muestra imagen, nombre, precio, etc.
// NO crea rutas ni páginas, solo es una pieza visual.



'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
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

  const getImageUrl = () => {
    if (imageError || !producto.imagen_principal) {
      return 'https://placehold.co/400x400.png?text=Imagen+No+Disponible';
    }
    const correctUrl = producto.imagen_principal.replace(
      '/product-images/product-images/',
      '/product-images/'
    );
    return correctUrl;
  };

  return (
    <Link href={`/productos/${producto.id}`} className="block group relative h-96 w-full overflow-hidden rounded-xl shadow-lg">
      {/* Imagen de Fondo con Efectos */}
      <Image
        src={getImageUrl()}
        alt={producto.nombre}
        fill
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:blur-sm"
        onError={handleImageError}
        priority={producto.destacado}
      />

      {/* Capa de Degradado Oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Contenido de la Tarjeta */}
      <div className="relative flex h-full flex-col items-start justify-between p-6 text-white">
        {/* Sección Superior: Categoría y Destacado */}
        <div className="flex justify-between items-center w-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">
            {producto.categoria || 'Nuevo'}
          </span>
          {producto.destacado && (
            <div className="bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              <span>Destacado</span>
            </div>
          )}
        </div>

        {/* Sección Inferior: Título, Precio y Botón */}
        <div className="w-full transition-transform duration-500 ease-in-out group-hover:-translate-y-2">
          <h3 className="text-2xl font-bold leading-tight mb-2">
            {producto.nombre}
          </h3>
          <p className="text-xl font-semibold text-gray-200 mb-4">${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}</p>
          <button
            onClick={handleAddToCart}
            disabled={producto.stock === 0}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0"
          >
            {producto.stock > 0 ? 'Agregar al pedido' : 'Sin stock'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
