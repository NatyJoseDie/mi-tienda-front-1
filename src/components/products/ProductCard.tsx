// Componente visual reutilizable para mostrar una TARJETA de producto
// Se usa dentro del listado (catálogo) y muestra imagen, nombre, precio, etc.
// NO crea rutas ni páginas, solo es una pieza visual.



'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
import { StarIcon } from '@heroicons/react/24/solid';

import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  producto: Producto;
}

const ProductCard = ({ producto }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(producto);
    alert(`${producto.nombre} ha sido agregado al pedido.`);
  };

  return (
    <div className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={`/productos/${producto.id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 relative">
          <Image
            src={producto.imagen_principal || 'https://placehold.co/400x400.png?text=Sin+Imagen'}
            alt={producto.nombre}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {/* Indicador de producto destacado */}
          {producto.destacado && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1.5 rounded-lg shadow-sm z-10">
              <StarIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-2 h-12 flex-1">
              {producto.nombre}
            </h3>
            {producto.destacado && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                Destacado
              </span>
            )}
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}</p>
        </div>
      </Link>
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={producto.stock === 0}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {producto.stock > 0 ? 'Agregar al pedido' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
