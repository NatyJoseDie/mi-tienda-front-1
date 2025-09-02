// Página de DETALLE de producto (una sola ficha)
// Esta página se muestra en /productos/[id] y muestra el detalle de un producto específico.
// Recibe el id por URL y trae los datos de ese producto desde el backend.

import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import type { Producto } from '@/types/producto';
import Link from "next/link";

// Función para obtener el producto por ID usando el cliente API centralizado
async function getProductById(id: string): Promise<Producto | null> {
  console.log('[FETCH] Buscando producto con id:', id);
  try {
    // Usar el cliente API centralizado
    const { getProductoPorId } = await import('@/lib/api-client');
    const productData = await getProductoPorId(id);
    console.log('[FETCH] Respuesta del backend:', productData);
    return productData || null;
  } catch (error) {
    console.error('[FETCH] Error al hacer fetch del producto:', error);
    return null; // Retornar null en caso de error para mostrar 404
  }
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Componente de página de producto individual
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  console.log('[PAGE] Renderizando detalle para id:', id);
  const product = await getProductById(id);
  if (!product) {
    console.log('[PAGE] Producto no encontrado, ejecutando notFound()');
    notFound();
  }
  return <ProductDetailClient product={product} />;
}