'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Producto } from '@/types/producto';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- Componente de Carrusel con Scroll Horizontal ---
const HorizontalScrollCarousel: React.FC<{ productos: Producto[] }> = ({ productos }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Ajusta el rango de salida para que el scroll sea más o menos largo
  // "1%" es el inicio, "-95%" es el final. Un valor más cercano a 0 en el final lo hace más corto.
  const x = useTransform(scrollYProgress, [0, 1], ["1%", `-${(productos.length - 1) * 25}%`]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute top-16 left-0 w-full z-10">
            <h2 className="text-3xl font-bold text-center mb-8">Nuestros Productos Estrella</h2>
        </div>
        <motion.div style={{ x }} className="flex gap-4">
          {productos.map((producto) => (
            <div key={producto.id} className="w-[350px] flex-shrink-0">
                <ProductCard producto={producto} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


// --- Página Principal del Catálogo ---
export default function CatalogoPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [regularProducts, setRegularProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_BASE_URL}/catalogo/visual`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Error al cargar productos: ${res.statusText}`);
        }
        const data = await res.json();
        let rawProducts = Array.isArray(data) ? data : (data && Array.isArray(data.data)) ? data.data : [];

        const validProducts = rawProducts.filter(
          (item: any): item is Producto =>
            item &&
            typeof item.id === 'string' &&
            typeof item.nombre === 'string' &&
            typeof item.precio_final === 'number' &&
            (item.imagen_principal === null || typeof item.imagen_principal === 'string') &&
            (item.destacado === undefined || typeof item.destacado === 'boolean')
        );

        // Separar productos destacados de los regulares
        const featured = validProducts.filter((p: Producto) => p.destacado);
        const regular = validProducts.filter((p: Producto) => !p.destacado);

        setFeaturedProducts(featured);
        setRegularProducts(regular);

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

  if (featuredProducts.length === 0 && regularProducts.length === 0) {
    return <div className="container mx-auto p-4 text-center">No hay productos disponibles en el catálogo.</div>;
  }

  return (
    <div className="bg-white">
      {featuredProducts.length > 0 && <HorizontalScrollCarousel productos={featuredProducts} />}

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Nuestro Catálogo</h1>
        {regularProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {regularProducts.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="text-center">Todos nuestros productos están destacados por el momento. ¡Explora nuestras estrellas!</p>
        )}
      </div>
    </div>
  );
}
