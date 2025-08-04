'use client';

import { useEffect, useState } from 'react';
import { Producto } from '@/types/producto';

const STOCK_CRITICO = 5;

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean; // corregido de 'activa'
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [editingPorcentaje, setEditingPorcentaje] = useState<{ [key: string]: boolean }>({});
  const [porcentajesTemp, setPorcentajesTemp] = useState<{ [key: string]: number }>({});
  const [isUpdatingPorcentaje, setIsUpdatingPorcentaje] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria_id: '',
    stockMinimo: '',
    stockMaximo: '',
    precioMinimo: '',
    precioMaximo: '',
    soloStockCritico: false,
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const agruparProductosPorCategoria = () => {
    const grupos: { [key: string]: { categoria: any; productos: Producto[] } } = {};

    productosFiltrados.forEach((producto) => {
      const categoriaKey = producto.categoria_id ? producto.categoria_id.toString() : 'sin-categoria';

      if (!grupos[categoriaKey]) {
        const categoria = producto.categoria_id
          ? categorias.find((cat) => cat.id === String(producto.categoria_id))
          : { id: 'sin-categoria', nombre: 'Sin categoría', activa: true };

        grupos[categoriaKey] = {
          categoria: categoria || { 
            id: `not-found-${producto.categoria_id || 'unknown'}`, 
            nombre: `Categoría no encontrada${producto.categoria_id ? ` (ID: ${producto.categoria_id})` : ''}`, 
            activa: true 
          },
          productos: [],
        };
      }

      grupos[categoriaKey].productos.push(producto);
    });

    return Object.values(grupos).sort((a, b) => a.categoria.nombre.localeCompare(b.categoria.nombre));
  };

  const toggleCategoria = (categoriaId: number) => {
    const [categoriasExpandidas, setCategoriasExpandidas] = useState<{[key: number]: boolean}>({});
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoriaId]: !prev[categoriaId],
    }));
  };

  const calcularPrecioFinal = (producto: Producto) => {
    const porcentaje = producto.porcentaje_aplicado || 45;
    return (producto.precio_costo || 0) * (1 + porcentaje / 100);
  };

  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      console.log('🔄 Iniciando carga de categorías...');
      const res = await fetch('http://localhost:3000/categorias', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('📡 Respuesta recibida:', res.status, res.ok);
      if (!res.ok) throw new Error('Error al cargar las categorías');
      const data = await res.json();
      console.log('📦 Datos recibidos:', data);
      const categoriasArray = Array.isArray(data) ? data : data.data || [];
      console.log('✅ Categorías procesadas:', categoriasArray);
      setCategorias(categoriasArray.filter((cat: Categoria) => cat.activo));
    } catch (err: any) {
      console.error('Error al cargar categorías:', err.message);
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showInactive
        ? 'http://localhost:3000/productos/inactivos'
        : 'http://localhost:3000/productos/publico';
      const res = await fetch(endpoint, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al cargar los productos');
      const data = await res.json();
      const productosArray = Array.isArray(data) ? data : data.data || [];
      const productosOrdenados = productosArray.sort((a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre));
      setProductos(productosOrdenados);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const obtenerNombreCategoria = (categoriaId: number | null | undefined) => {
    if (!categoriaId) return 'Sin categoría';
    if (loadingCategorias) return 'Cargando...';
    if (categorias.length === 0) return 'Cargando...';
    // Buscar por ID como string y como número
    const categoria = categorias.find((cat) => 
      cat.id === String(categoriaId) || 
      Number(cat.id) === categoriaId
    );
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, [showInactive]);

  const aplicarFiltros = () => {
    let filtrados = [...productos];
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (prod: Producto) => prod.nombre.toLowerCase().includes(busqueda) || (prod.sku && prod.sku.toLowerCase().includes(busqueda))
      );
    }
    if (filtros.categoria_id) {
      filtrados = filtrados.filter((prod: Producto) =>
        prod.categoria_id && filtros.categoria_id && String(prod.categoria_id) === String(filtros.categoria_id)
      );
    }
    if (filtros.stockMinimo) {
      filtrados = filtrados.filter((prod: Producto) => prod.stock >= parseInt(filtros.stockMinimo));
    }
    if (filtros.stockMaximo) {
      filtrados = filtrados.filter((prod: Producto) => prod.stock <= parseInt(filtros.stockMaximo));
    }
    if (filtros.precioMinimo) {
      filtrados = filtrados.filter((prod: Producto) => (prod.precio_final || 0) >= parseFloat(filtros.precioMinimo));
    }
    if (filtros.precioMaximo) {
      filtrados = filtrados.filter((prod: Producto) => (prod.precio_final || 0) <= parseFloat(filtros.precioMaximo));
    }
    if (filtros.soloStockCritico) {
      filtrados = filtrados.filter((prod: Producto) => prod.stock <= STOCK_CRITICO);
    }
    setProductosFiltrados(filtrados);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [productos, filtros]); // Dependencias para que se ejecute al cambiar productos o filtros

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const valor = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      [name]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria_id: '',
      stockMinimo: '',
      stockMaximo: '',
      precioMinimo: '',
      precioMaximo: '',
      soloStockCritico: false,
    });
  };

  const calcularPrecioTemporal = (producto: Producto, porcentajeTemp: number) => {
    if (!producto.precio_costo) return producto.precio_final || 0;
    return producto.precio_costo * (1 + porcentajeTemp / 100);
  };

  const handleUpdatePorcentaje = async (id: string, nuevoPorcentaje: number) => {
    setIsUpdatingPorcentaje(true);
    try {
      const res = await fetch(`http://localhost:3000/productos/${id}/porcentaje-ganancia`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ porcentaje: nuevoPorcentaje }),
      });
      if (!res.ok) throw new Error('Error al actualizar el porcentaje');
      await fetchProductos();
      setTimeout(() => {
        setPorcentajesTemp((prev) => {
          const newTemp = { ...prev };
          delete newTemp[id];
          return newTemp;
        });
      }, 500);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el porcentaje');
    } finally {
      setIsUpdatingPorcentaje(false);
    }
  };

  // Agregar esta función que falta
  const handlePorcentajeChange = (productId: string, increment: number) => {
    const currentPorcentaje = porcentajesTemp[productId] ?? 
      productos.find(p => p.id === productId)?.porcentaje_aplicado ?? 45;
    
    const newPorcentaje = Math.max(0, Math.min(1000, currentPorcentaje + increment));
    
    // Actualizar porcentaje temporal para feedback inmediato en la UI
    setPorcentajesTemp(prev => ({
      ...prev,
      [productId]: newPorcentaje
    }));
    
    // Debounce de la llamada a la API
    clearTimeout((window as any)[`timeout_${productId}`]);
    (window as any)[`timeout_${productId}`] = setTimeout(() => {
      handleUpdatePorcentaje(productId, newPorcentaje);
    }, 800);
  };

  const handleGenerarPreciosConsumidorFinal = async () => {
    try {
      const response = await fetch('http://localhost:3000/precios/generar-consumidor-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.mensaje + '\nProductos actualizados: ' + data.productos_actualizados);
        await fetchProductos();
      } else {
        alert('Error: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error en la petición');
    }
  };

  const handleDownloadExcel = () => {
    console.log('Descargar Excel');
  };

  const handleDownloadPDF = () => {
    console.log('Descargar PDF');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Productos</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={handleDownloadExcel}
          >
            📊 Descargar Excel
          </button>
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            onClick={handleDownloadPDF}
          >
            📄 Descargar PDF
          </button>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleGenerarPreciosConsumidorFinal}
          >
            💰 Generar Precios Consumidor Final
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Mostrar productos inactivos</span>
          </label>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">🔍 Filtros de Búsqueda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar (Nombre/SKU)
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              placeholder="Buscar producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filtros.categoria_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loadingCategorias}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {loadingCategorias && (
              <span className="text-xs text-gray-500 mt-1">Cargando categorías...</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filtros.stockMinimo}
                onChange={(e) => setFiltros(prev => ({ ...prev, stockMinimo: e.target.value }))}
                placeholder="Mín"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                value={filtros.stockMaximo}
                onChange={(e) => setFiltros(prev => ({ ...prev, stockMaximo: e.target.value }))}
                placeholder="Máx"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Final
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filtros.precioMinimo}
                onChange={(e) => setFiltros(prev => ({ ...prev, precioMinimo: e.target.value }))}
                placeholder="Mín"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                value={filtros.precioMaximo}
                onChange={(e) => setFiltros(prev => ({ ...prev, precioMaximo: e.target.value }))}
                placeholder="Máx"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filtros.soloStockCritico}
              onChange={(e) => setFiltros(prev => ({ ...prev, soloStockCritico: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Solo stock crítico</span>
          </label>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>

            <span className="text-sm text-gray-600">
              Mostrando {productosFiltrados.length} de {productos.length} productos
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando productos...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center text-gray-500">
          {productos.length === 0 
            ? (showInactive ? 'No hay productos inactivos.' : 'No hay productos registrados.')
            : 'No se encontraron productos con los filtros aplicados.'
          }
        </div>
      ) : (
        <div className="space-y-8">
          {agruparProductosPorCategoria().map((grupo) => (
            <div key={grupo.categoria.id}>
              <h2 className="text-2xl font-bold mb-4 text-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-l-4 border-indigo-500">
                📦 {grupo.categoria.nombre}
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <table className="w-full table-auto">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📋 Producto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📊 Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">💰 Precio Costo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📈 % Ganancia</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">💵 Precio Final</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">🔄 Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {grupo.productos.map((prod, index) => (
                      <tr key={prod.id} className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {/* Imagen del producto */}
                            <div className="w-12 h-12 mr-4 flex-shrink-0">
                              {prod.imagen_principal ? (
                                <img 
                                  src={prod.imagen_principal} 
                                  alt={prod.nombre}
                                  className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    target.style.display = 'none';
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs ${prod.imagen_principal ? 'hidden' : 'flex'}`}>
                                📦
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900 mb-1">{prod.nombre}</div>
                              <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                🏷️ SKU: {prod.sku || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-2 inline-flex text-sm font-bold rounded-lg shadow-sm ${
                            prod.stock <= STOCK_CRITICO 
                              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
                              : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                          }`}>
                            {prod.stock <= STOCK_CRITICO ? '⚠️' : '✅'} {prod.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-semibold text-gray-800 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                            💲 ${prod.precio_costo?.toLocaleString() ?? 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex-shrink-0">
                              <span className="text-base font-bold text-blue-800">
                                {(porcentajesTemp[prod.id] ?? prod.porcentaje_aplicado ?? 45).toFixed(1)}%
                              </span>
                              {prod.usa_porcentaje_individual && 
                                <span className="text-xs text-blue-600 ml-1 bg-blue-100 px-1 rounded">(Individual)</span>
                              }
                            </div>
                            <div className="flex flex-col gap-0.5 flex-shrink-0">
                              <button 
                                onClick={() => handlePorcentajeChange(prod.id, 0.1)} 
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-1 py-0.5 rounded transition-colors duration-200 shadow-sm w-4 h-4 flex items-center justify-center leading-none"
                                title="Aumentar porcentaje"
                              >
                                ▲
                              </button>
                              <button 
                                onClick={() => handlePorcentajeChange(prod.id, -0.1)} 
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded transition-colors duration-200 shadow-sm w-4 h-4 flex items-center justify-center leading-none"
                                title="Disminuir porcentaje"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                            💰 ${(porcentajesTemp[prod.id] 
                              ? calcularPrecioTemporal(prod, porcentajesTemp[prod.id])
                              : calcularPrecioFinal(prod)
                            ).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-lg shadow-sm ${
                            prod.activo 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-300'
                          }`}>
                            {prod.activo ? '🟢 Activo' : '🔴 Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}