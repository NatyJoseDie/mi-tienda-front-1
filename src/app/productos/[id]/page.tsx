// Página de DETALLE de producto (una sola ficha)
// Esta página se muestra en /productos/[id] y muestra el detalle de un producto específico.
// Recibe el id por URL y trae los datos de ese producto desde el backend.

import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import type { Producto } from '@/types/producto';
import Link from "next/link";

// Función para obtener el producto por ID con logs detallados
async function getProductById(id: string): Promise<Producto | null> {
  console.log('[FETCH] Buscando producto con id:', id);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mi-tienda-backend-o9i7.onrender.com';
  try {
    // Usar el endpoint público específico para producto individual
    const res = await fetch(`${API_BASE_URL}/catalogo/producto/${id}`, {
      cache: 'no-store'
    });
    console.log('[FETCH] Status:', res.status);
    if (!res.ok) {
      if (res.status === 404) {
        console.log('[FETCH] Producto no encontrado (404)');
        return null;
      }
      console.log('[FETCH] Error status:', res.status, 'StatusText:', res.statusText);
      throw new Error(`Error al obtener los datos del producto: ${res.status} ${res.statusText}`);
    }
    const productData = await res.json();
    console.log('[FETCH] Respuesta del backend:', productData);
    // El backend devuelve un objeto, no un array
    return productData || null;
  } catch (error) {
    console.error('[FETCH] Error al hacer fetch del producto:', error);
    throw error;
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