'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProductos, crearPedido } from '@/lib/api-client';
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

interface ProductoCarrito {
  producto_id: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
}

interface DatosRevendedor {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

// Conectar al backend real

export default function RevendedorPage() {
  const router = useRouter();
  const [vista, setVista] = useState<'inicio' | 'lista' | 'catalogo' | 'carrito'>('inicio');
  const [productos, setProductos] = useState<ProductoRevendedor[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [datosRevendedor, setDatosRevendedor] = useState<DatosRevendedor>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [loadingData, setLoadingData] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [porcentajeGanancia, setPorcentajeGanancia] = useState<number>(0);
  const [loadingPorcentaje, setLoadingPorcentaje] = useState(false);
  const [error, setError] = useState<string>('');
  const [cantidades, setCantidades] = useState<{[key: string]: number}>({});

  const categorias = [...new Set((productos || []).map(p => p.categoria))];

  // Cargar productos al montar y cuando cambie la vista
  useEffect(() => {
    if (vista === 'lista' || vista === 'catalogo') {
      cargarProductos();
    }
  }, [vista]);

  // Cargar porcentaje de ganancia al montar el componente
  useEffect(() => {
    obtenerPorcentajeGanancia();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoadingData(true);
      setError('');
      const { data } = await api.get('/revendedores/lista-precios');
      const productosData = data.data ?? data;
      setProductos(Array.isArray(productosData) ? productosData : []);
    } catch (error: any) {
      console.error('Error cargando lista de precios:', error);
      const mensaje = error?.response?.status === 403 ? 'No autorizado para ver la lista de precios' : error.message ?? 'Error desconocido';
      setError(mensaje);
      setProductos([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Función para obtener el porcentaje de ganancia actual
  const obtenerPorcentajeGanancia = async () => {
    try {
      setLoadingPorcentaje(true);
      const { data } = await api.get('/revendedores/porcentaje-ganancia');
      console.log('Porcentaje de ganancia obtenido:', data);
      setPorcentajeGanancia(data.valor ?? 0);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        console.warn('Acceso denegado a /revendedores/porcentaje-ganancia; usando valor por defecto 30%');
        setPorcentajeGanancia(30);
      } else {
        console.error('Error obteniendo porcentaje de ganancia:', error);
        setPorcentajeGanancia(30);
      }
    } finally {
      setLoadingPorcentaje(false);
    }
  };

  // Función para actualizar el porcentaje de ganancia
  const actualizarPorcentajeGanancia = async (nuevoPorcentaje: number) => {
    try {
      setLoadingPorcentaje(true);
      const { data } = await api.post('/revendedores/porcentaje-ganancia', { valor: nuevoPorcentaje });
      
      console.log('Porcentaje actualizado:', data);
      
      setPorcentajeGanancia(data.valor || nuevoPorcentaje);
      // Recargar productos para ver los nuevos precios
      await cargarProductos();
      alert('Porcentaje de ganancia actualizado correctamente');
    } catch (error: any) {
      console.error('Error actualizando porcentaje de ganancia:', error);
      alert(`Error al actualizar el porcentaje de ganancia: ${error.message}`);
    } finally {
      setLoadingPorcentaje(false);
    }
  };

  const productosFiltrados = (productos || []).filter(p => {
    const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    const coincideBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const agregarAlCarrito = (producto: ProductoRevendedor, cantidad: number) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.producto_id === producto.id 
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_revendedor,
        cantidad,
        stock: producto.stock
      }]);
    }
    
    alert(`${producto.nombre} agregado al carrito`);
  };

  const eliminarDelCarrito = (producto_id: string) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id));
  };

  const actualizarCantidadCarrito = (producto_id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(producto_id);
      return;
    }
    
    setCarrito(carrito.map(item => 
      item.producto_id === producto_id 
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const enviarPedido = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!datosRevendedor.nombre || !datosRevendedor.email || !datosRevendedor.telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const pedidoData = {
        nombre: datosRevendedor.nombre,
        email: datosRevendedor.email,
        telefono: datosRevendedor.telefono,
        direccion: datosRevendedor.direccion,
        productos: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        })),
        total: calcularTotal()
      };

      const { data: result } = await api.post('/revendedores/pedido', pedidoData);

      alert('Pedido enviado correctamente. Recibirás un email de confirmación.');
      
      // Limpiar carrito y datos
      setCarrito([]);
      setDatosRevendedor({ nombre: '', email: '', telefono: '', direccion: '' });
      setVista('inicio');
    } catch (error: any) {
      console.error('Error enviando pedido:', error);
      alert(`Error al enviar el pedido: ${error.message}`);
    }
  };

  const descargarExcel = async () => {
    try {
      const response = await api.get('/revendedores/exportar/excel', { responseType: 'blob' });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lista-revendedor.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error descargando Excel:', error);
      alert(`Error al descargar Excel: ${error.message}`);
    }
  };

  const descargarPDF = async () => {
    try {
      const response = await api.get('/revendedores/catalogo-visual/pdf', { responseType: 'blob' });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalogo-visual-revendedor.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error descargando PDF:', error);
      alert(`Error al descargar PDF: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Portal Revendedores
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              Ganancia: {porcentajeGanancia}%
            </span>
            {carrito.length > 0 && (
              <button
                onClick={() => setVista('carrito')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-lg flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
              >
                <span>🛒</span>
                <span>Carrito ({carrito.length})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mostrar errores */}
      {error && (
        <div className="relative z-10 bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200 px-4 py-3 rounded-lg mx-4 mt-4 shadow-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Navegación */}
      <nav className="relative z-10 bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {['inicio', 'lista', 'catalogo', 'carrito'].map((v) => (
              <button
                key={v}
                onClick={() => setVista(v as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-all duration-300 ${
                  vista === v
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                    : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {v === 'inicio' ? 'Inicio' : 
                 v === 'lista' ? 'Lista de Precios' :
                 v === 'catalogo' ? 'Catálogo Visual' : 'Carrito'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {vista === 'inicio' && (
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Bienvenido al Portal de Revendedores
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 hover:border-blue-400/50">
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">Lista de Precios</h3>
                <p className="text-gray-300 mb-4 text-sm">Consulta todos los productos con precios mayoristas</p>
                <button
                  onClick={() => setVista('lista')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 font-medium"
                >
                  Ver Lista
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-500 hover:border-green-400/50">
                <div className="text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors duration-300">Catálogo Visual</h3>
                <p className="text-gray-300 mb-4 text-sm">Explora productos con imágenes y detalles</p>
                <button
                  onClick={() => setVista('catalogo')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50 font-medium"
                >
                  Ver Catálogo
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 hover:border-purple-400/50">
                <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12V14H16V12H8M8,16V18H13V16H8Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors duration-300">Descargar Excel</h3>
                <p className="text-gray-300 mb-4 text-sm">Lista completa en formato Excel</p>
                <button
                  onClick={descargarExcel}
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 font-medium"
                >
                  Descargar
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-500 hover:border-red-400/50">
                <div className="text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,2V13H10V22L17,10H13L17,2H7Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-red-300 transition-colors duration-300">Hacer Pedido</h3>
                <p className="text-gray-300 mb-4 text-sm">Realiza tu pedido personalizado</p>
                <button
                  onClick={() => setVista('carrito')}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50 font-medium"
                >
                  Ver Carrito ({carrito.length})
                </button>
              </div>
            </div>
            
            {productosFiltrados.length === 0 && !loadingData && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos que coincidan con los filtros.
              </div>
            )}
          </div>
        )}

        {vista === 'catalogo' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Catálogo Visual</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Ganancia aplicada: {porcentajeGanancia}%
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <label className="text-sm font-medium text-gray-700">Porcentaje:</label>
                  <input
                    type="number"
                    value={porcentajeGanancia}
                    onChange={(e) => setPorcentajeGanancia(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-16 text-center text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm">%</span>
                  <button
                    onClick={() => actualizarPorcentajeGanancia(porcentajeGanancia)}
                    disabled={loadingPorcentaje}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingPorcentaje ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar producto</label>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Nombre del producto..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría</label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Cargando productos...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosFiltrados.map((producto) => (
                  <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <img
                        src={producto.imagen || producto.imagen_principal || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDIwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEM5My4yNTQ4IDgwIDEwNCA5MC43NDUyIDEwNCAxMDRDMTA0IDExNy4yNTUgOTMuMjU0OCAxMjggODAgMTI4QzY2Ljc0NTIgMTI4IDU2IDExNy4yNTUgNTYgMTA0QzU2IDkwLjc0NTIgNjYuNzQ1MiA4MCA4MCA4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE0NCA2NEMxNDkuNTIzIDY0IDE1NCA2OC40NzcyIDE1NCA3NEMxNTQgNzkuNTIyOCAxNDkuNTIzIDg0IDE0NCA4NEMxMzguNDc3IDg0IDEzNCA3OS41MjI4IDEzNCA3NEMxMzQgNjguNDc3MiAxMzguNDc3IDY0IDE0NCA2NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='}
                        alt={producto.nombre}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-48 bg-gray-200 flex items-center justify-center"><span class="text-gray-400">Sin imagen</span></div>';
                          }
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{producto.categoria}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          producto.stock > 10 ? 'bg-green-100 text-green-800' :
                          producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Stock: {producto.stock}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">
                          {formatearPrecio(producto.precio_revendedor)}
                        </span>
{producto.stock > 0 ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => {
                                  const nuevaCantidad = Math.max(1, (cantidades[producto.id] || 1) - 1);
                                  setCantidades(prev => ({...prev, [producto.id]: nuevaCantidad}));
                                }}
                                className="px-1 py-1 text-gray-600 hover:bg-gray-100 text-xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={producto.stock}
                                value={cantidades[producto.id] || 1}
                                onChange={(e) => {
                                  const valor = Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1));
                                  setCantidades(prev => ({...prev, [producto.id]: valor}));
                                }}
                                className="w-12 px-1 py-1 text-center border-0 focus:outline-none text-xs"
                              />
                              <button
                                onClick={() => {
                                  const nuevaCantidad = Math.min(producto.stock, (cantidades[producto.id] || 1) + 1);
                                  setCantidades(prev => ({...prev, [producto.id]: nuevaCantidad}));
                                }}
                                className="px-1 py-1 text-gray-600 hover:bg-gray-100 text-xs"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                agregarAlCarrito(producto, cantidades[producto.id] || 1);
                                setCantidades(prev => ({...prev, [producto.id]: 1})); // Reset cantidad
                              }}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              Agregar
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {productosFiltrados.length === 0 && !loadingData && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos que coincidan con los filtros.
              </div>
            )}
          </div>
        )}

        {vista === 'carrito' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Carrito de Compras</h2>
            
            {carrito.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <button
                  onClick={() => setVista('lista')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Ir a Lista de Precios
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Lista de productos en el carrito */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Productos en el carrito</h3>
                      <div className="space-y-4">
                        {carrito.map((item) => (
                          <div key={item.producto_id} className="flex items-center justify-between border-b pb-4">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.nombre}</h4>
                              <p className="text-sm text-gray-600">
                                {formatearPrecio(item.precio_unitario)} x {item.cantidad}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => actualizarCantidadCarrito(item.producto_id, item.cantidad - 1)}
                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <button
                                onClick={() => actualizarCantidadCarrito(item.producto_id, item.cantidad + 1)}
                                disabled={item.cantidad >= item.stock}
                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300 disabled:opacity-50"
                              >
                                +
                              </button>
                              <button
                                onClick={() => eliminarDelCarrito(item.producto_id)}
                                className="text-red-600 hover:text-red-800 ml-4"
                              >
                                🗑️
                              </button>
                            </div>
                            <div className="text-right ml-4">
                              <span className="font-semibold">
                                {formatearPrecio(item.precio_unitario * item.cantidad)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario y resumen */}
                <div>
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Datos del Revendedor</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                          type="text"
                          value={datosRevendedor.nombre}
                          onChange={(e) => setDatosRevendedor({...datosRevendedor, nombre: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={datosRevendedor.email}
                          onChange={(e) => setDatosRevendedor({...datosRevendedor, email: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                        <input
                          type="tel"
                          value={datosRevendedor.telefono}
                          onChange={(e) => setDatosRevendedor({...datosRevendedor, telefono: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <textarea
                          value={datosRevendedor.direccion}
                          onChange={(e) => setDatosRevendedor({...datosRevendedor, direccion: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Productos ({carrito.length})</span>
                        <span>{formatearPrecio(calcularTotal())}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>{formatearPrecio(calcularTotal())}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={enviarPedido}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Enviar Pedido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}