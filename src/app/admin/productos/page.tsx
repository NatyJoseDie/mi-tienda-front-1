'use client';

import { useEffect, useState } from 'react';
import { Producto } from '@/types/producto';
import EditarProductoModal from '@/components/EditarProductoModal';

const STOCK_CRITICO = 5;
// API_URL ya no es necesario - usando cliente API centralizado

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

  // Estados para el modal de edición
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);

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
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<{[key: number]: boolean}>({});

  // Función para abrir el modal de edición
  const abrirModalEditar = (producto: Producto) => {
    console.log('🔍 Abriendo modal para producto:', producto.nombre);
    setProductoAEditar(producto);
    setModalEditarAbierto(true);
  };

  // Función para cerrar el modal de edición
  const cerrarModalEditar = () => {
    console.log('❌ Cerrando modal de edición');
    setModalEditarAbierto(false);
    setProductoAEditar(null);
  };

  // Función para manejar la actualización del producto
  const handleProductoActualizado = (productoActualizado: Producto) => {
    console.log('✅ Producto actualizado:', productoActualizado.nombre);
    setProductos(prev => 
      prev.map(p => p.id === productoActualizado.id ? { ...p, ...productoActualizado } : p)
    );
  };

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
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  const calcularPrecioFinal = (producto: Producto) => {
    const porcentaje = producto.porcentaje_aplicado || 45;
    // Usamos el costo ajustado como base. Si no existe, usamos el costo original como fallback.
    const baseCosto = producto.precio_costo_ajustado ?? producto.precio_costo ?? 0;
    return baseCosto * (1 + porcentaje / 100);
  };

  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      console.log('🔄 Iniciando carga de categorías...');
      const { default: api } = await import('@/lib/api');
      const response = await api.get('/categorias');
      console.log('📦 Datos recibidos:', response.data);
      const categoriasArray = Array.isArray(response.data) ? response.data : response.data.data || [];
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
      const { default: api } = await import('@/lib/api');
      const endpoint = showInactive ? '/productos/inactivos' : '/productos/publico';
      const response = await api.get(endpoint);
      const productosArray = Array.isArray(response.data) ? response.data : response.data.data || [];
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
    // Usamos el costo ajustado como base. Si no existe, usamos el costo original como fallback.
    const baseCosto = producto.precio_costo_ajustado ?? producto.precio_costo ?? 0;
    return baseCosto * (1 + porcentajeTemp / 100);
  };

  const handleUpdatePorcentaje = async (id: string, nuevoPorcentaje: number) => {
    setIsUpdatingPorcentaje(true);
    try {
      const { default: api } = await import('@/lib/api');
      await api.patch(`/productos/${id}/porcentaje-ganancia`, { porcentaje: nuevoPorcentaje });
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

  const handlePorcentajeChange = (productId: string, increment: number) => {
    const currentPorcentaje = porcentajesTemp[productId] ?? 
      productos.find(p => p.id === productId)?.porcentaje_aplicado ?? 45;
    
    const newPorcentaje = Math.max(0, Math.min(1000, currentPorcentaje + increment));
    
    setPorcentajesTemp(prev => ({
      ...prev,
      [productId]: newPorcentaje
    }));
    
    clearTimeout((window as any)[`timeout_${productId}`]);
    (window as any)[`timeout_${productId}`] = setTimeout(() => {
      handleUpdatePorcentaje(productId, newPorcentaje);
    }, 800);
  };

  const handleGenerarPreciosConsumidorFinal = async () => {
    try {
      const { default: api } = await import('@/lib/api');
      const response = await api.post('/precios/generar-consumidor-final');
      alert(response.data.mensaje + '\nProductos actualizados: ' + response.data.productos_actualizados);
      await fetchProductos();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  };

  const handleDownloadExcel = () => {
    console.log('Descargar Excel');
  };

  const handleDownloadPDF = () => {
    console.log('Descargar PDF');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/admin'}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
              </svg>
              Volver al Panel
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
          </div>
        </div>
      
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2 font-medium"
              onClick={handleDownloadExcel}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12V14H16V12H8M8,16V18H13V16H8Z" />
              </svg>
              Descargar Excel
            </button>
            <button 
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center gap-2 font-medium"
              onClick={handleDownloadPDF}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,10.5H7V12.5H10V10.5M17,10.5H14V12.5H17V10.5M10,13.5H7V15.5H10V13.5M17,13.5H14V15.5H17V13.5M10,16.5H7V18.5H10V16.5M17,16.5H14V18.5H17V16.5Z" />
              </svg>
              Descargar PDF
            </button>
            <button 
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 font-medium"
              onClick={handleGenerarPreciosConsumidorFinal}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
              </svg>
              Generar Precios Consumidor Final
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-200 font-medium">Mostrar productos inactivos</span>
            </label>
          </div>
        </div>

      {/* Panel de Filtros */}
      <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">🔍 Filtros de Búsqueda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar (Nombre/SKU)
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              placeholder="Buscar producto..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filtros.categoria_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              <input
                type="number"
                value={filtros.stockMaximo}
                onChange={(e) => setFiltros(prev => ({ ...prev, stockMaximo: e.target.value }))}
                placeholder="Máx"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              <input
                type="number"
                value={filtros.precioMaximo}
                onChange={(e) => setFiltros(prev => ({ ...prev, precioMaximo: e.target.value }))}
                placeholder="Máx"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando productos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-12">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          </div>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-12">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-500 font-medium">
                {productos.length === 0 
                  ? (showInactive ? 'No hay productos inactivos.' : 'No hay productos registrados.')
                  : 'No se encontraron productos con los filtros aplicados.'
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {agruparProductosPorCategoria().map((grupo) => (
            <div key={grupo.categoria.id}>
              <h2 className="text-2xl font-bold mb-4 text-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-l-4 border-indigo-500">
                📦 {grupo.categoria.nombre}
              </h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] table-auto">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📋 Producto</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📊 Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">💰 Precio Costo</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📈 % Ganancia</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">💵 Precio Final</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">🔄 Estado</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">📝 Acciones</th>
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
                            {/* Mostramos el costo ajustado aquí */}
                            💲 ${(prod.precio_costo_ajustado ?? prod.precio_costo)?.toLocaleString() ?? 'N/A'}
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => abrirModalEditar(prod)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                              title="Editar producto"
                            >
                              ✏️ Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                
                {/* Versión responsive para móviles - Cards */}
                <div className="md:hidden space-y-4">
                  {grupo.productos.map((prod) => (
                    <div key={prod.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          {prod.imagen_principal ? (
                            <img 
                              src={prod.imagen_principal} 
                              alt={prod.nombre}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
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
                          <div className={`w-full h-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm ${prod.imagen_principal ? 'hidden' : 'flex'}`}>
                            📦
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 mb-1">{prod.nombre}</h3>
                          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                            🏷️ SKU: {prod.sku || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <span className={`ml-1 font-bold ${prod.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {prod.stock}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado:</span>
                          <span className={`ml-1 font-bold ${prod.activo ? 'text-green-600' : 'text-red-600'}`}>
                            {prod.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Costo:</span>
                          <span className="ml-1 font-bold text-gray-900">
                            ${(prod.precio_costo_ajustado ?? prod.precio_costo)?.toLocaleString() ?? 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ganancia:</span>
                          <span className="ml-1 font-bold text-blue-600">
                            {(porcentajesTemp[prod.id] ?? prod.porcentaje_aplicado ?? 45).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-gray-600 text-sm">Precio Final:</span>
                        <span className="ml-1 text-lg font-bold text-green-700">
                          ${(porcentajesTemp[prod.id] 
                            ? calcularPrecioTemporal(prod, porcentajesTemp[prod.id])
                            : calcularPrecioFinal(prod)
                          ).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => abrirModalEditar(prod)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      <EditarProductoModal
        abierto={modalEditarAbierto}
        onClose={cerrarModalEditar}
        producto={productoAEditar}
        onGuardar={handleProductoActualizado}
      />
      </div>
    </div>
  );
}