'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface ProductoRevendedor {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  imagen_principal?: string;
  imagenes?: string[];
  stock: number;
  precio_revendedor: number;
  unidad_id?: string;
  porcentaje_ganancia_aplicado?: number;
}

export default function CatalogoRevendedorPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<ProductoRevendedor[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [porcentajeGanancia, setPorcentajeGanancia] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [particulas, setParticulas] = useState<Array<{left: number, top: number, width: number, height: number, delay: number, duration: number}>>([]);

  const categorias = [...new Set((productos || []).map(p => p.categoria))];

  useEffect(() => {
    cargarProductos();
    obtenerPorcentajeGanancia();
    
    // Generar partículas solo en el cliente
    const nuevasParticulas = Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2
    }));
    setParticulas(nuevasParticulas);
  }, []);

  const cargarProductos = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      const { data: result } = await api.get('/revendedores/lista-precios');
      
      const productosData = result.data || result;
      
      if (Array.isArray(productosData) && productosData.length > 0) {
        setProductos(productosData);
      } else {
        setProductos([]);
      }
    } catch (error: unknown) {
      console.error('Error cargando productos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error al cargar productos: ${errorMessage}`);
      
      // Fallback a datos mock si falla el backend
      const productosMock: ProductoRevendedor[] = [
        {
          id: '1',
          nombre: 'Producto Demo 1',
          descripcion: 'Descripción del producto demo',
          categoria: 'Categoría A',
          imagen: '/placeholder-product.jpg',
          stock: 10,
          precio_revendedor: 100,
          porcentaje_ganancia_aplicado: 20
        },
        {
          id: '2',
          nombre: 'Producto Demo 2',
          descripcion: 'Otra descripción demo',
          categoria: 'Categoría B',
          imagen: '/placeholder-product.jpg',
          stock: 5,
          precio_revendedor: 150,
          porcentaje_ganancia_aplicado: 20
        }
      ];
      setProductos(productosMock);
    } finally {
      setLoadingData(false);
    }
  };

  const obtenerPorcentajeGanancia = async () => {
    try {
      const { data } = await api.get('/revendedores/porcentaje-ganancia');
      setPorcentajeGanancia(data.porcentaje || data.valor || 20);
    } catch (error) {
      console.error('Error obteniendo porcentaje de ganancia:', error);
      setPorcentajeGanancia(20); // Valor por defecto
    }
  };

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Partículas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {particulas.map((particula, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-10 animate-pulse"
            style={{
              left: `${particula.left}%`,
              top: `${particula.top}%`,
              width: `${particula.width}px`,
              height: `${particula.height}px`,
              animationDelay: `${particula.delay}s`,
              animationDuration: `${particula.duration}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-md border-b border-white/20 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 group text-white"
            >
              <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              Catálogo Revendedores
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-300 font-bold bg-black/50 px-3 py-1 rounded-full">
              Ganancia aplicada: {porcentajeGanancia}%
            </span>
          </div>
        </div>
      </header>

      {/* Mostrar errores */}
      {error && (
        <div className="relative z-10 bg-red-900/80 backdrop-blur-md border border-red-400/50 text-red-100 px-4 py-3 rounded-lg mx-4 mt-4 shadow-lg">
          <strong className="font-bold">Error:</strong> <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/20 p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-lg"
              />
            </div>
            <div className="md:w-64">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-lg"
              >
                <option value="" className="bg-gray-900 text-white">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria} className="bg-gray-900 text-white">
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-white mt-4 font-bold text-lg drop-shadow-lg bg-black/50 px-4 py-2 rounded-lg">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => {
              const precioConGanancia = producto.precio_revendedor * (1 + porcentajeGanancia / 100);
              
              return (
                <div
                  key={producto.id}
                  className="bg-black/60 backdrop-blur-md border border-white/30 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                >
                  {/* Imagen del producto */}
                  <div className="relative h-48 bg-gray-800/50 flex items-center justify-center overflow-hidden">
                    {producto.imagen_principal || producto.imagen ? (
                      <img
                        src={producto.imagen_principal || producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <PhotoIcon className="h-12 w-12 mb-2" />
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="p-4 bg-black/40">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-md">
                      {producto.nombre}
                    </h3>
                    <p className="text-gray-100 text-sm mb-3 line-clamp-2 drop-shadow-sm">
                      {producto.descripcion}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-200 text-sm font-medium">Categoría:</span>
                        <span className="text-cyan-300 text-sm font-bold bg-black/50 px-2 py-1 rounded">{producto.categoria}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-200 text-sm font-medium">Stock:</span>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${
                          producto.stock > 10 ? 'text-green-200 bg-green-900/50' : 
                          producto.stock > 0 ? 'text-yellow-200 bg-yellow-900/50' : 'text-red-200 bg-red-900/50'
                        }`}>
                          {producto.stock} unidades
                        </span>
                      </div>
                      
                      <div className="border-t border-white/20 pt-2 mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-200 text-sm font-medium">Precio base:</span>
                          <span className="text-white text-sm font-bold bg-black/50 px-2 py-1 rounded">
                            ${producto.precio_revendedor.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200 text-sm font-medium">Precio sugerido:</span>
                          <span className="text-green-200 text-lg font-bold bg-green-900/50 px-2 py-1 rounded">
                            ${precioConGanancia.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-xs text-cyan-200 font-medium bg-black/50 px-2 py-1 rounded">
                            Ganancia: ${(precioConGanancia - producto.precio_revendedor).toFixed(2)} ({porcentajeGanancia}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loadingData && productosFiltrados.length === 0 && (
          <div className="text-center py-12 bg-black/50 rounded-xl mx-4">
            <PhotoIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">No se encontraron productos</h3>
            <p className="text-gray-100 font-medium">
              {busqueda || filtroCategoria 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay productos disponibles en este momento'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}