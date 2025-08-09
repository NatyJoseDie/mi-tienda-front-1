// Componente visual para mostrar el DETALLE completo de un producto
// Se usa dentro de la página de detalle y muestra galería, descripción, stock, botón agregar al carrito, etc.
// NO crea rutas ni páginas, solo es una pieza visual.



'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería de Imágenes */}
        <div>
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg border-2 border-gray-200">
            <Image
              src={mainImage}
              alt={product.nombre}
              width={600}
              height={600}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
              priority
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {allImages.map((img, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200" onClick={() => setMainImage(img)}>
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
        </div>

        {/* Detalles del Producto */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900">{product.nombre}</h1>
          <p className="text-gray-500 mt-1">Categoría: {product.categoria}</p>

          {/* Precio */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {/* Solución 2: Añadimos '?? 0' para dar un valor por defecto */}
              ${(product.precio_final ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Descripción */}
          <div className="mt-6">
            <div className="prose max-w-none text-gray-700 mb-6">
              <p>{product.descripcion}</p>
            </div>

            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-semibold">En stock ({product.stock} disponibles)</p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">Sin stock</p>
            )}
          </div>

          {/* Botón de Agregar al Carrito */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!hasValidPrice || product.stock === 0}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Sin stock' : (hasValidPrice ? 'Agregar al pedido' : 'No disponible para compra')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
