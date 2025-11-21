'use client';

import { useState, useEffect } from 'react';
import { mockAPI, isMockMode, setMockMode } from '@/utils/mockData';
import api from '@/lib/api';

interface Producto {
  id: string;
  nombre: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  precio_final: number;
}

interface VentaMinorista {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_venta: number;
  nombre_comprador: string;
  metodo_pago?: string;
  notas?: string;
  factura?: boolean;
  fecha: string;
  ganancia_total: number;
  productos?: { nombre: string };
}

export default function AdminVentasMinoristas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<VentaMinorista[]>([]);
  
  // Estados para el formulario simplificado
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para el carrito de productos
  const [carritoProductos, setCarritoProductos] = useState<Array<{
    producto: Producto;
    cantidad: number;
    precio_venta: number;
    subtotal: number;
    ganancia: number;
  }>>([]);
  const [nombreComprador, setNombreComprador] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [notas, setNotas] = useState('');
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarVentas, setMostrarVentas] = useState(false);

  // Todas las llamadas se realizan vía cliente centralizado (baseURL /api/proxy)

  const cargarProductos = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar desde backend primero
      try {
        const { data: response_data } = await api.get(`/productos?conGanancia=true`);
        // El backend devuelve los productos en response_data.data
        const productos_array = response_data.data || [];
        setProductos(Array.isArray(productos_array) ? productos_array : []);
        setMockMode(false); // Backend disponible
      } catch (backendError) {
        console.warn('Backend no disponible, usando datos mock:', backendError);
        setMockMode(true); // Activar modo mock
        const mockData = await mockAPI.getProductos();
        setProductos(Array.isArray(mockData) ? mockData : []);
      }
    } catch (error) {
      console.warn('No se pudieron cargar los productos. Esto puede deberse a que el backend no está ejecutándose:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarVentas = async () => {
    try {
      setLoading(true);
      
      if (isMockMode()) {
        // Usar datos mock si está en modo mock
        const mockData = await mockAPI.getVentas();
        setVentas(Array.isArray(mockData) ? mockData : []);
      } else {
        // Intentar cargar desde backend
        try {
          const { data: response_data } = await api.get(`/ventas/minoristas`);
           // Aceptar tanto un array directo como un objeto con "data"/"results"/"items"
           const ventas_array = Array.isArray(response_data)
             ? response_data
             : (response_data.data ?? response_data.results ?? response_data.items ?? []);
           setVentas(Array.isArray(ventas_array) ? ventas_array : []);
        } catch (backendError) {
          console.warn('Backend no disponible para ventas, usando datos mock:', backendError);
          const mockData = await mockAPI.getVentas();
          setVentas(Array.isArray(mockData) ? mockData : []);
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar las ventas. Esto puede deberse a que el backend no está ejecutándose:', error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarVentas();
  }, []);

  // Actualizar precio de venta cuando se selecciona un producto
  useEffect(() => {
    if (productoSeleccionado) {
      setPrecioVenta(productoSeleccionado.precio_final || 0);
    }
  }, [productoSeleccionado]);

  // Cuando el usuario cambia a la pestaña "Ver Ventas", recargamos la lista
  useEffect(() => {
    if (mostrarVentas) {
      cargarVentas();
    }
  }, [mostrarVentas]);

  const calcularGananciaTotal = () => {
    if (!productoSeleccionado) return 0;
    const ganancia = (precioVenta - productoSeleccionado.precio_costo) * cantidad;
    return ganancia;
  };

  // Funciones para el carrito
  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0 || precioVenta <= 0) {
      alert('Por favor completa todos los campos del producto');
      return;
    }

    if (cantidad > productoSeleccionado.stock) {
      alert(`No hay suficiente stock. Stock disponible: ${productoSeleccionado.stock}`);
      return;
    }

    const subtotal = cantidad * precioVenta;
    const ganancia = (precioVenta - productoSeleccionado.precio_costo) * cantidad;

    const nuevoItem = {
      producto: productoSeleccionado,
      cantidad,
      precio_venta: precioVenta,
      subtotal,
      ganancia
    };

    setCarritoProductos([...carritoProductos, nuevoItem]);
    
    // Limpiar selección actual
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioVenta(0);
  };

  const quitarDelCarrito = (index: number) => {
    const nuevoCarrito = carritoProductos.filter((_, i) => i !== index);
    setCarritoProductos(nuevoCarrito);
  };

  const calcularTotalCarrito = () => {
    return carritoProductos.reduce((total, item) => total + item.subtotal, 0);
  };

  const calcularGananciaTotalCarrito = () => {
    return carritoProductos.reduce((total, item) => total + item.ganancia, 0);
  };

  const calcularTotal = () => {
    return precioVenta * cantidad;
  };

  const registrarVenta = async () => {
    if (carritoProductos.length === 0) {
      alert('Por favor agrega al menos un producto al carrito');
      return;
    }

    if (!nombreComprador.trim()) {
      alert('Por favor ingresa el nombre del comprador');
      return;
    }

    setLoading(true);
    try {
      if (isMockMode()) {
        // Usar API mock
        const ventaData = {
          comprador: nombreComprador,
          metodoPago,
          productos: carritoProductos.map(item => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precio_venta,
            subtotal: item.cantidad * item.precio_venta
          })),
          total: calcularTotalCarrito(),
          gananciaTotal: calcularGananciaTotalCarrito(),
          notas,
          facturaEmitida: requiereFactura
        };
        
        await mockAPI.registrarVenta(ventaData);
        alert(`Venta registrada exitosamente con ${carritoProductos.length} producto(s) (Modo Demo)`);
      } else {
        const productosPayload = carritoProductos
          .map((item) => ({ id: item.producto?.id, cantidad: item.cantidad }))
          .filter((p) => typeof p.id === 'string' && p.id.trim() !== '' && p.cantidad > 0);

        if (productosPayload.length === 0) {
          alert('No hay productos válidos para registrar');
          setLoading(false);
          return;
        }

        const metodo = (metodoPago || '').toLowerCase();
        let metodo_pago: string = '';
        if (metodo.includes('efect')) metodo_pago = 'efectivo';
        else if (metodo.includes('trans')) metodo_pago = 'transferencia';
        else if (metodo.includes('tarjeta')) metodo_pago = 'tarjeta';
        else if (metodo.includes('mercado')) metodo_pago = 'mercadopago';

        if (!metodo_pago) {
          alert('Selecciona un método de pago válido');
          setLoading(false);
          return;
        }

        const body = {
          productos: productosPayload,
          metodo_pago,
          cliente: nombreComprador || undefined,
          notas: notas || undefined,
        };
        console.log('Payload a enviar:', body);
        console.log('productosPayload:', productosPayload);
        console.log('metodo_pago normalizado:', metodo_pago);
        await api.post(`/ventas/minoristas`, body);

        alert(`Venta registrada exitosamente con ${carritoProductos.length} producto(s) (Backend)`);
        setCarritoProductos([]);
        setNombreComprador('');
        setMetodoPago('');
        setNotas('');
        setRequiereFactura(false);
        await cargarVentas();
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error('Error al registrar venta:', status, data, error);
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        (data ? JSON.stringify(data) : '') ||
        error.message ||
        'Ocurrió un error al registrar la venta';
      alert(`Error ${status ?? ''} ${msg}`.trim());
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      const { data: blob } = await api.get(`/ventas/minoristas/exportar-excel`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ventas-minoristas.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar las ventas');
    }
  };

  const limpiarFormulario = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioVenta(0);
    setFechaVenta(new Date().toISOString().split('T')[0]);
    setCarritoProductos([]);
    setNombreComprador('');
    setMetodoPago('');
    setNotas('');
    setRequiereFactura(false);
  };

  if (loading && productos.length === 0 && ventas.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ventas Minoristas</h1>
        <p className="text-gray-600 mb-4">Registra ventas directas a consumidores finales.</p>
        
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isMockMode() 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {isMockMode() ? '🔧 Modo Demo (Sin Backend)' : '🟢 Conectado al Backend'}
          </div>
          {isMockMode() && (
            <button
              onClick={() => {
                setMockMode(false);
                cargarProductos();
                cargarVentas();
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              🔄 Reintentar Backend
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMostrarVentas(false)}
          className={`px-4 py-2 rounded ${!mostrarVentas ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Registrar Venta
        </button>
        <button
          onClick={() => setMostrarVentas(true)}
          className={`px-4 py-2 rounded ${mostrarVentas ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Ver Ventas
        </button>
      </div>

      {!mostrarVentas ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Registrar Nueva Venta (Consumidor Final)</h2>
          </div>

          {productos.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-yellow-800 font-medium">No hay productos disponibles</p>
                  <p className="text-yellow-700 text-sm">Asegúrate de que el backend esté ejecutándose y que existan productos.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1: Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <select
                value={productoSeleccionado?.id || ''}
                onChange={(e) => {
                  const producto = productos.find(p => p.id === e.target.value);
                  setProductoSeleccionado(producto || null);
                }}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={!Array.isArray(productos) || productos.length === 0}
              >
                <option value="">Seleccionar producto</option>
                {Array.isArray(productos) && productos.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} (Stock: {producto.stock})
                  </option>
                ))}
              </select>
              {productoSeleccionado && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock disponible: {productoSeleccionado.stock}
                </p>
              )}
            </div>

            {/* Columna 2: Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
              <input
                type="number"
                min="1"
                max={productoSeleccionado?.stock || 1}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!productoSeleccionado}
              />
              {productoSeleccionado && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock disponible: {productoSeleccionado.stock}
                </p>
              )}
            </div>

            {/* Columna 3: Costo Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Costo Unitario</label>
              <input
                type="text"
                value={productoSeleccionado ? productoSeleccionado.precio_costo.toLocaleString() : ''}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Precio Venta Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio Venta Unitario</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!productoSeleccionado}
              />
            </div>

            {/* Fecha de Venta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha de Venta</label>
              <input
                type="date"
                value={fechaVenta}
                onChange={(e) => setFechaVenta(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Nombre del Comprador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👤 Nombre del Comprador</label>
              <input
                type="text"
                value={nombreComprador}
                onChange={(e) => setNombreComprador(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💳 Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="MercadoPago">MercadoPago</option>
              </select>
            </div>
          </div>

          {/* Ganancia del Producto Actual */}
           {productoSeleccionado && (
             <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">Ganancia del Producto Actual</label>
               <div className="text-xl font-bold text-blue-600">
                 ${calcularGananciaTotal().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
               <p className="text-sm text-gray-600 mt-1">
                 (Precio venta - Costo) × Cantidad = (${precioVenta} - ${productoSeleccionado?.precio_costo || 0}) × {cantidad}
               </p>
               
               {/* Botón Agregar al Carrito */}
               <div className="mt-4">
                 <button
                   onClick={agregarAlCarrito}
                   disabled={!productoSeleccionado || cantidad <= 0 || precioVenta <= 0}
                   className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                 >
                   <span>🛒</span>
                   Agregar al Carrito
                 </button>
               </div>
             </div>
           )}

           {/* Carrito de Productos */}
           {carritoProductos.length > 0 && (
             <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
               <h3 className="text-lg font-semibold text-gray-800 mb-4">🛒 Productos en el Carrito</h3>
               
               {/* Vista de tabla para desktop */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full border-collapse border border-gray-300 min-w-[768px]">
                   <thead>
                     <tr className="bg-gray-100">
                       <th className="border border-gray-300 p-2 text-left">Producto</th>
                       <th className="border border-gray-300 p-2 text-left">Cantidad</th>
                       <th className="border border-gray-300 p-2 text-left">Precio Unit.</th>
                       <th className="border border-gray-300 p-2 text-left">Subtotal</th>
                       <th className="border border-gray-300 p-2 text-left">Ganancia</th>
                       <th className="border border-gray-300 p-2 text-left">Acción</th>
                     </tr>
                   </thead>
                   <tbody>
                     {carritoProductos.map((item, index) => (
                       <tr key={index}>
                         <td className="border border-gray-300 p-2">{item.producto.nombre}</td>
                         <td className="border border-gray-300 p-2">{item.cantidad}</td>
                         <td className="border border-gray-300 p-2">${item.precio_venta.toLocaleString()}</td>
                         <td className="border border-gray-300 p-2">${item.subtotal.toLocaleString()}</td>
                         <td className="border border-gray-300 p-2 text-green-600 font-semibold">
                           ${item.ganancia.toLocaleString()}
                         </td>
                         <td className="border border-gray-300 p-2">
                           <button
                             onClick={() => quitarDelCarrito(index)}
                             className="text-red-500 hover:text-red-700 font-medium"
                           >
                             Quitar
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Vista de tarjetas para móvil */}
               <div className="md:hidden space-y-3">
                 {carritoProductos.map((item, index) => (
                   <div key={index} className="bg-white border border-gray-300 rounded-lg p-3">
                     <div className="flex justify-between items-start mb-2">
                       <div className="font-medium text-gray-900">{item.producto.nombre}</div>
                       <button
                         onClick={() => quitarDelCarrito(index)}
                         className="text-red-500 hover:text-red-700 font-medium text-sm"
                       >
                         Quitar
                       </button>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                       <div>
                         <span className="text-gray-600">Cantidad:</span>
                         <span className="ml-1 font-medium">{item.cantidad}</span>
                       </div>
                       <div>
                         <span className="text-gray-600">Precio Unit.:</span>
                         <span className="ml-1 font-medium">${item.precio_venta.toLocaleString()}</span>
                       </div>
                       <div>
                         <span className="text-gray-600">Subtotal:</span>
                         <span className="ml-1 font-medium">${item.subtotal.toLocaleString()}</span>
                       </div>
                       <div>
                         <span className="text-gray-600">Ganancia:</span>
                         <span className="ml-1 font-medium text-green-600">${item.ganancia.toLocaleString()}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Totales del Carrito */}
               <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="text-lg font-semibold text-gray-800">
                       Total de la Venta: ${calcularTotalCarrito().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                     <p className="text-lg font-semibold text-green-600">
                       Ganancia Total: ${calcularGananciaTotalCarrito().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                   </div>
                   <div className="text-sm text-gray-600">
                     {carritoProductos.length} producto(s)
                   </div>
                 </div>
               </div>
             </div>
           )}

          {/* Notas Adicionales */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notas Adicionales</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Notas sobre la venta, cliente, etc."
            />
          </div>

          {/* Factura Emitida */}
          <div className="mt-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={requiereFactura}
                onChange={(e) => setRequiereFactura(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">📄 Factura Emitida</span>
            </label>
          </div>

          {/* Botones de Acción */}
           <div className="mt-8 flex gap-4">
             <button
               onClick={registrarVenta}
               disabled={loading || carritoProductos.length === 0 || !nombreComprador.trim()}
               className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
             >
               <span>💰</span>
               {loading ? 'Registrando...' : `Registrar Venta (${carritoProductos.length} productos)`}
             </button>
             
             {carritoProductos.length > 0 && (
               <button
                 onClick={() => setCarritoProductos([])}
                 className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
               >
                 <span>🗑️</span>
                 Limpiar Carrito
               </button>
             )}
           </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Historial de Ventas Minoristas</h2>
            <button
              onClick={exportarExcel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Exportar Excel
            </button>
          </div>

          {ventas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Fecha</th>
                    <th className="border border-gray-300 p-2 text-left">Producto</th>
                    <th className="border border-gray-300 p-2 text-left">Cantidad</th>
                    <th className="border border-gray-300 p-2 text-left">Precio</th>
                    <th className="border border-gray-300 p-2 text-left">Total</th>
                    <th className="border border-gray-300 p-2 text-left">Comprador</th>
                    <th className="border border-gray-300 p-2 text-left">Método Pago</th>
                    <th className="border border-gray-300 p-2 text-left">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="border border-gray-300 p-2">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {venta.productos?.nombre || 'Desconocido'}
                      </td>
                      <td className="border border-gray-300 p-2">{venta.cantidad}</td>
                      <td className="border border-gray-300 p-2">${venta.precio_venta}</td>
                      <td className="border border-gray-300 p-2">
                        ${(venta.cantidad * venta.precio_venta).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">{venta.nombre_comprador}</td>
                      <td className="border border-gray-300 p-2">{venta.metodo_pago || '-'}</td>
                      <td className="border border-gray-300 p-2">
                        {venta.factura ? 'Sí' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Vista de tarjetas para móvil */}
              <div className="md:hidden space-y-4">
              {ventas.map((venta) => (
                <div key={venta.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{venta.productos?.nombre || 'Desconocido'}</div>
                      <div className="text-sm text-gray-500">{new Date(venta.fecha).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${(venta.cantidad * venta.precio_venta).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{venta.factura ? '📄 Con factura' : 'Sin factura'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="ml-1 font-medium">{venta.cantidad}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio Unit.:</span>
                      <span className="ml-1 font-medium">${venta.precio_venta}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Comprador:</span>
                      <span className="ml-1 font-medium">{venta.nombre_comprador}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Método Pago:</span>
                      <span className="ml-1 font-medium">{venta.metodo_pago || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}