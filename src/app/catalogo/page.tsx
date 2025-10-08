'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Producto } from '@/types/producto';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { SparklesIcon, FireIcon, StarIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { getSafeImage } from '@/utils/imageUtils';

// --- Componente de Carrusel Moderno con Imágenes Superpuestas ---
const ModernCarousel: React.FC<{ productos: Producto[] }> = ({ productos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [productos.length, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % productos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + productos.length) % productos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Normaliza posibles duplicaciones de '/product-images/' en URLs provenientes de Supabase Storage
  const normalizeSupabaseImageUrl = (url: string) => {
    if (!url) return '';
    return url.replace(/\/product-images\/(?:product-images\/)+/g, '/product-images/').trim();
  };

  const getImageUrl = (producto: Producto) => {
    if (!producto.imagen_principal) {
      return '/placeholder.jpg';
    }
    // Si la imagen es de placehold.co, usar placeholder local por defecto
    if (producto.imagen_principal.includes('placehold.co')) {
      return '/placeholder.jpg';
    }
    return normalizeSupabaseImageUrl(producto.imagen_principal);
  };

  return (
    <section className="relative h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Título siempre visible */}
      <div className="absolute top-8 left-0 right-0 z-20 text-center">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <FireIcon className="w-10 h-10 text-orange-400 animate-pulse" />
          <h2 className="text-5xl font-bold text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
            ✨ Productos Estrella ✨
          </h2>
          <SparklesIcon className="w-10 h-10 text-yellow-400 animate-bounce" />
        </motion.div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-300 text-xl max-w-3xl mx-auto drop-shadow-lg"
        >
          Descubre nuestra selección premium de productos más populares
        </motion.p>
      </div>

      {/* Carrusel principal */}
      <div 
        className="relative h-full flex items-center justify-center"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Imágenes superpuestas */}
        <div className="relative w-full max-w-6xl h-[500px] mx-auto">
          {productos.map((producto, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);
            const isActive = index === currentIndex;
            
            return (
              <motion.div
                key={producto.id}
                className="absolute inset-0 cursor-pointer"
                initial={false}
                animate={{
                  x: offset * 100,
                  scale: isActive ? 1 : 0.8 - absOffset * 0.1,
                  zIndex: productos.length - absOffset,
                  opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.3,
                  rotateY: offset * 15,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
                onClick={() => goToSlide(index)}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                  <Image
                    src={getSafeImage(producto.imagen_principal)}
                    alt={producto.nombre}
                    fill
                    className="object-cover"
                    priority={isActive}
                  />
                  
                  {/* Overlay con información del producto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Información del producto */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: isActive ? 0 : 20, opacity: isActive ? 1 : 0.7 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                        {producto.nombre}
                      </h3>
                      <p className="text-3xl font-bold text-green-400 mb-2">
                        ${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-300">
                        {producto.categoria || 'Categoría'}
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* Badge de destacado */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg animate-pulse">
                      <StarIcon className="w-4 h-4" />
                      <span>Estrella</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Controles de navegación */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores de puntos */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {productos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Botón de ver producto actual */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <Link 
          href={`/productos/${productos[currentIndex]?.id}`}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl backdrop-blur-sm border border-white/20"
        >
          Ver Producto ✨
        </Link>
      </div>
    </section>
  );
};

// --- Componente de Sección de Productos Regulares ---
const RegularProductsSection: React.FC<{ productos: Producto[] }> = ({ productos }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-8"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <StarIcon className="w-6 h-6 text-indigo-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Nuestro Catálogo Completo
          </h1>
          <StarIcon className="w-6 h-6 text-indigo-500" />
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explora toda nuestra colección de productos cuidadosamente seleccionados para ti
        </p>
      </motion.div>
      
      {productos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productos.map((producto, index) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -5 }}
            >
              <ProductCard producto={producto} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-gray-500 text-lg"
        >
          Todos nuestros productos están destacados por el momento. ¡Explora nuestras estrellas!
        </motion.p>
      )}
    </motion.div>
  );
};


// --- Componente de Filtros ---
const FilterSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}> = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 mx-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        {/* Filtro por categorías */}
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white min-w-[200px]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// --- Componente de Productos por Categoría ---
const CategorySection: React.FC<{
  category: string;
  productos: Producto[];
  searchTerm: string;
}> = ({ category, productos, searchTerm }) => {
  const filteredProducts = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {filteredProducts.map((producto) => (
          <motion.div
            key={producto.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <ProductCard producto={producto} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Página Principal del Catálogo ---
export default function CatalogoPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [regularProducts, setRegularProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Producto[]>>({});

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar el cliente API centralizado
        const { getProductos } = await import('@/lib/api-client');
        const data = await getProductos();
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

        // Agrupar productos regulares por categoría
        const groupedByCategory = regular.reduce((acc: Record<string, Producto[]>, producto: Producto) => {
          const category = producto.categoria || 'Sin Categoría';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(producto);
          return acc;
        }, {});

        setFeaturedProducts(featured);
        setRegularProducts(regular);
        setProductsByCategory(groupedByCategory);

      } catch (err: any) {
        console.error("Error fetching products:", err);
        // En producción no usar datos de demostración a menos que se permita explícitamente
        const allowDemoFallback = process.env.NEXT_PUBLIC_ALLOW_DEMO_FALLBACK === 'true';
        if (!allowDemoFallback) {
          setFeaturedProducts([]);
          setRegularProducts([]);
          setProductsByCategory({});
          setError('No se pudo conectar al servidor. Por favor, intenta nuevamente en unos segundos.');
          setLoading(false);
          return;
        }
        // Fallback de demostración opcional
        const mockProducts: Producto[] = [
          {
            id: '1',
            nombre: 'Secador de pelo plegable 1800W',
            descripcion: 'Secador de pelo profesional plegable con motor de 1800W, tecnología iónica y múltiples velocidades.',
            precio_costo: 20000,
            precio_final: 31211.25,
            stock: 15,
            activo: true,
            categoria_id: 'cp1',
            categoria: 'Cuidado Personal',
            imagen_principal: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=600&fit=crop',
            destacado: true
          },
          {
            id: '2',
            nombre: 'Plancha de cabello profesional',
            descripcion: 'Plancha de cabello con placas de cerámica y turmalina, calentamiento rápido y control de temperatura.',
            precio_costo: 28000,
            precio_final: 45000,
            stock: 12,
            activo: true,
            categoria_id: 'cp1',
            categoria: 'Cuidado Personal',
            imagen_principal: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop',
            destacado: true
          },
          {
            id: '3',
            nombre: 'Rizador de cabello cerámico',
            descripcion: 'Rizador de cabello con barril cerámico de 25mm, temperatura ajustable y función de apagado automático.',
            precio_costo: 18000,
            precio_final: 28500,
            stock: 20,
            activo: true,
            categoria_id: 'cp1',
            categoria: 'Cuidado Personal',
            imagen_principal: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=600&fit=crop',
            destacado: true
          },
          {
            id: '4',
            nombre: 'Kit de maquillaje profesional',
            descripcion: 'Kit completo de maquillaje profesional con paleta de sombras, bases, labiales y pinceles de alta calidad.',
            precio_costo: 32000,
            precio_final: 52000,
            stock: 8,
            activo: true,
            categoria_id: 'b1',
            categoria: 'Belleza',
            imagen_principal: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
            destacado: false
          },
          {
            id: '5',
            nombre: 'Crema hidratante facial',
            descripcion: 'Crema hidratante facial con ácido hialurónico y vitamina E, ideal para todo tipo de piel.',
            precio_costo: 12000,
            precio_final: 18900,
            stock: 25,
            activo: true,
            categoria_id: 'cp2',
            categoria: 'Cuidado de la Piel',
            imagen_principal: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop',
            destacado: false
          }
        ];
        
        const featured = mockProducts.filter((p: Producto) => p.destacado);
        const regular = mockProducts.filter((p: Producto) => !p.destacado);
        
        // Agrupar productos de prueba por categoría
        const groupedByCategory = regular.reduce((acc: Record<string, Producto[]>, producto: Producto) => {
          const category = producto.categoria || 'Sin Categoría';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(producto);
          return acc;
        }, {});
        
        setFeaturedProducts(featured);
        setRegularProducts(regular);
        setProductsByCategory(groupedByCategory);
        setError('Usando datos de demostración (sin conexión al servidor)');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Cargando productos...</div>;
  }

  if (error && featuredProducts.length === 0 && Object.keys(productsByCategory).length === 0) {
    return <div className="container mx-auto p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (featuredProducts.length === 0 && Object.keys(productsByCategory).length === 0) {
    return <div className="container mx-auto p-4 text-center">No hay productos disponibles en el catálogo.</div>;
  }

  // Obtener todas las categorías disponibles
  const allCategories = Object.keys(productsByCategory);
  
  // Filtrar productos por categoría seleccionada
  const filteredProductsByCategory = selectedCategory
    ? { [selectedCategory]: productsByCategory[selectedCategory] || [] }
    : productsByCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Carrusel de productos destacados */}
      {featuredProducts.length > 0 && <ModernCarousel productos={featuredProducts} />}
      
      {/* Mensaje de demostración si hay error */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-8 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sección de filtros */}
      <div className="pt-8">
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={allCategories}
        />
      </div>
      
      {/* Productos agrupados por categorías */}
      <div className="pb-16">
        {Object.entries(filteredProductsByCategory).map(([category, productos]) => (
          <CategorySection
            key={category}
            category={category}
            productos={productos}
            searchTerm={searchTerm}
          />
        ))}
        
        {/* Mensaje cuando no hay resultados */}
        {Object.entries(filteredProductsByCategory).every(([_, productos]) => 
          productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length === 0
        ) && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No se encontraron productos que coincidan con tu búsqueda</div>
            <div className="text-gray-400 text-sm mt-2">Intenta con otros términos o selecciona una categoría diferente</div>
          </div>
        )}
      </div>
      
      {/* Sección de pie con gradiente */}
      <div className="h-32 bg-gradient-to-t from-indigo-100 to-transparent"></div>
    </div>
  );
}
