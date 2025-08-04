// src/app/catalogo/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Producto } from '@/types/producto';

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming your API endpoint for public products is /api/productos or similar
        // You might need to adjust this URL based on your backend
        const res = await fetch('http://localhost:3000/catalogo/visual', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Error al cargar productos: ${res.statusText}`);
        }
        const data = await res.json();
        // Ensure data is an array, or extract it if it's wrapped in an object
        let rawProducts = [];
        if (Array.isArray(data)) {
          rawProducts = data;
        } else if (data && Array.isArray(data.data)) {
          rawProducts = data.data;
        }

        const validProducts = rawProducts.filter(
          (item: any): item is Producto =>
            item &&
            typeof item.id === 'string' &&
            typeof item.nombre === 'string' &&
            typeof item.precio_final === 'number' &&
            (item.imagen_principal === null || typeof item.imagen_principal === 'string')
        );
        
        // Ordenar productos: destacados primero
        const sortedProducts = validProducts.sort((a, b) => {
          // Si a es destacado y b no, a va primero
          if (a.destacado && !b.destacado) return -1;
          // Si b es destacado y a no, b va primero
          if (b.destacado && !a.destacado) return 1;
          // Si ambos son destacados o ninguno es destacado, mantener orden original
          return 0;
        });
        
        setProductos(sortedProducts);
      } catch (err: any) {
        setError(err.message || 'Error desconocido al cargar productos.');
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando productos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (productos.length === 0) {
    return <div className="container mx-auto p-4 text-center">No hay productos disponibles en el catálogo.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Nuestro Catálogo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
