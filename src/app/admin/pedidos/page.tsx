'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Pedido } from '@/services/pedidos';
import { usePedidos } from '@/hooks/usePedidos';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const estadoConfig = {
  pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pendiente' },
  confirmado: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Confirmado' },
  preparando: { color: 'bg-purple-100 text-purple-800', icon: ShoppingBagIcon, label: 'Preparando' },
  enviado: { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon, label: 'Enviado' },
  entregado: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Entregado' },
  cancelado: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Cancelado' }
};

export default function AdminPedidos() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    pedidos,
    loading,
    error,
    actualizandoEstado,
    cargarPedidos,
    actualizarEstado: actualizarEstadoPedido,
    clearError
  } = usePedidos();

  // Estados del componente
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [estadoParaVideo, setEstadoParaVideo] = useState<string>('');
  const [pedidoParaVideo, setPedidoParaVideo] = useState<string>('');
  // Mapa de toggles por pedido para habilitar entrega manual/externa
  const [entregaManualMap, setEntregaManualMap] = useState<Record<string, boolean>>({});

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // No renderizar nada si no está autenticado (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  const actualizarEstado = async (pedidoId: string, nuevoEstado: string) => {
    const entregaManual = nuevoEstado === 'entregado' && entregaManualMap[pedidoId];
    
    const result = await actualizarEstadoPedido(pedidoId, nuevoEstado, entregaManual);
    
    if (result.success) {
      alert(`✅ Pedido actualizado a: ${estadoConfig[nuevoEstado as keyof typeof estadoConfig]?.label}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const actualizarEstadoConVideo = async (pedidoId: string, nuevoEstado: string, video?: File) => {
    try {
      
      const formData = new FormData();
      formData.append('estado', nuevoEstado);
      if (video) {
        // Solo enviar bajo la key 'video'. No setear Content-Type manualmente.
        formData.append('video', video);
      }

      const response = await fetch(`${API_URL}/productos/admin/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        credentials: 'include', // Incluir cookies
        body: formData,
      });

      if (response.ok) {
        await cargarPedidos();
        alert(`✅ Pedido actualizado a: ${estadoConfig[nuevoEstado as keyof typeof estadoConfig]?.label}`);
        // Limpiar estado del video
        setVideoFile(null);
        setVideoPreview(null);
        setShowVideoModal(false);
      } else {
        const text = await response.text().catch(() => '');
        console.error('Actualizar estado (con video) fallo:', { status: response.status, text });
        alert(`❌ Error al actualizar el pedido (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    } finally {
      // El estado se maneja internamente en el hook
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea un video
      if (!file.type.startsWith('video/')) {
        alert('❌ Por favor selecciona un archivo de video válido');
        return;
      }
      
      // Validar tamaño (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('❌ El video no debe superar los 50MB');
        return;
      }

      setVideoFile(file);
      
      // Crear preview
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const abrirModalVideo = (pedidoId: string, estado: string) => {
    setPedidoParaVideo(pedidoId);
    setEstadoParaVideo(estado);
    setShowVideoModal(true);
  };

  const cerrarModalVideo = () => {
    setShowVideoModal(false);
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setPedidoParaVideo('');
    setEstadoParaVideo('');
  };

  const pedidosFiltrados = pedidos.filter(pedido => 
    !filtroEstado || pedido.estado === filtroEstado
  );

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-1">Administra y actualiza el estado de todos los pedidos</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-red-800">Error al cargar pedidos</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                clearError();
                cargarPedidos();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Posibles soluciones:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Verifica que el servidor backend esté corriendo en el puerto 3000</li>
              <li>• Comprueba tu conexión a internet</li>
              <li>• Asegúrate de estar autenticado correctamente</li>
              <li>• Revisa la consola del navegador para más detalles</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600 mt-1">Administra y actualiza el estado de todos los pedidos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Object.entries(estadoConfig).map(([estado, config]) => {
          const count = pedidos.filter(p => p.estado === estado).length;
          const Icon = config.icon;
          return (
            <div key={estado} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${config.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          {Object.entries(estadoConfig).map(([estado, config]) => (
            <option key={estado} value={estado}>{config.label}</option>
          ))}
        </select>
        <button
          onClick={cargarPedidos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Vista de tabla para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[768px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Pedido</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => {
                const config = estadoConfig[pedido.estado];
                const Icon = config.icon;
                
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        #{pedido.id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.pedido_items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {pedido.observaciones?.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.observaciones?.email || 'Sin email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatearFecha(pedido.fecha)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                        <Icon className="w-4 h-4 mr-1" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${(pedido.total_calculado || pedido.total || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPedidoSeleccionado(pedido);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                          <div className="flex flex-col gap-1">
                            {/* Entrega manual/externa: solo relevante al intentar pasar a 'entregado' si está 'enviado' */}
                            <label className="flex items-center gap-2 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!entregaManualMap[pedido.id]}
                                onChange={(e) => setEntregaManualMap((prev) => ({ ...prev, [pedido.id]: e.target.checked }))}
                              />
                              Entrega manual/externa
                            </label>
                            {/* Cambiar estado sin video */}
                            <select
                              value=""
                              onChange={(e) => {
                                const next = e.target.value as Pedido['estado'] | '';
                                if (!next) return;
                                // Bloqueo: si actual es 'enviado', no permitir 'entregado' salvo toggle
                                if (pedido.estado === 'enviado' && next === 'entregado' && !entregaManualMap[pedido.id]) {
                                  alert('Este pedido fue enviado y solo el cliente puede confirmar la recepción desde el email. Para forzar una entrega externa, activa "Entrega manual/externa".');
                                  return;
                                }
                                actualizarEstado(pedido.id, next);
                              }}
                              disabled={actualizandoEstado === pedido.id}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">🔄 Sin video</option>
                              {Object.entries(estadoConfig)
                                .filter(([estado]) => estado !== pedido.estado)
                                .filter(([estado]) => {
                                  // Ocultar 'entregado' si el pedido está 'enviado' y no está habilitada entrega manual
                                  if (pedido.estado === 'enviado' && estado === 'entregado' && !entregaManualMap[pedido.id]) return false;
                                  return true;
                                })
                                .map(([estado, config]) => (
                                  <option key={estado} value={estado}>{config.label}</option>
                                ))}
                            </select>
                            
                            {/* Cambiar estado con video */}
                            <select
                              value=""
                              onChange={(e) => {
                                const next = e.target.value;
                                if (!next) return;
                                setPedidoParaVideo(pedido.id);
                                setEstadoParaVideo(next);
                                setShowVideoModal(true);
                              }}
                              disabled={actualizandoEstado === pedido.id}
                              className="text-xs border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 bg-green-50"
                            >
                              <option value="">📹 Con video</option>
                              {/* Solo permitir flujo con video para pasar a 'enviado' */}
                              {pedido.estado !== 'enviado' && (
                                <option value="enviado">📹 {estadoConfig['enviado'].label}</option>
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para móvil */}
        <div className="md:hidden">
          {pedidosFiltrados.map((pedido) => {
            const config = estadoConfig[pedido.estado];
            const Icon = config.icon;
            
            return (
              <div key={pedido.id} className="border-b border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      Pedido #{pedido.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.pedido_items?.length || 0} items • {formatearFecha(pedido.fecha)}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </span>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pedido.observaciones?.nombre || 'Sin nombre'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pedido.observaciones?.email || 'Sin email'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-gray-900">
                    ${(pedido.total_calculado || pedido.total || 0).toLocaleString('es-AR')}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">
              {filtroEstado ? `No hay pedidos con estado "${estadoConfig[filtroEstado as keyof typeof estadoConfig]?.label}"` : 'No se encontraron pedidos'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pedido #{pedidoSeleccionado.id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Info del Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nombre:</span> {pedidoSeleccionado.observaciones?.nombre || 'No especificado'}</p>
                    <p><span className="font-medium">Email:</span> {pedidoSeleccionado.observaciones?.email || 'No especificado'}</p>
                    <p><span className="font-medium">Teléfono:</span> {pedidoSeleccionado.observaciones?.telefono || 'No especificado'}</p>
                    <p><span className="font-medium">Dirección:</span> {pedidoSeleccionado.observaciones?.direccion || 'No especificada'}</p>
                  </div>
                </div>

                {/* Info del Pedido */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Información del Pedido
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Fecha:</span> {formatearFecha(pedidoSeleccionado.fecha)}</p>
                    <p><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${estadoConfig[pedidoSeleccionado.estado].color}`}>
                        {estadoConfig[pedidoSeleccionado.estado].label}
                      </span>
                    </p>
                    <p><span className="font-medium">Total:</span> ${(pedidoSeleccionado.total_calculado || pedidoSeleccionado.total || 0).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              </div>

              {/* Items del Pedido */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Items del Pedido
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Producto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cantidad</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Precio Unit.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pedidoSeleccionado.pedido_items?.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ID: {item.producto_id.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.cantidad}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${item.precio_unitario.toLocaleString('es-AR')}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notas */}
              {pedidoSeleccionado.observaciones?.notas && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Notas del Cliente</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{pedidoSeleccionado.observaciones.notas}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              {pedidoSeleccionado.estado !== 'entregado' && pedidoSeleccionado.estado !== 'cancelado' && (
                <div className="flex gap-3 pt-4 border-t">
                  {Object.entries(estadoConfig)
                    .filter(([estado]) => estado !== pedidoSeleccionado.estado)
                    .map(([estado, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={estado}
                          onClick={() => {
                            actualizarEstado(pedidoSeleccionado.id, estado);
                            setShowModal(false);
                          }}
                          disabled={actualizandoEstado === pedidoSeleccionado.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            estado === 'entregado' 
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : estado === 'cancelado'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          Marcar como {config.label}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Video */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  📹 Agregar Video - Pedido #{pedidoParaVideo.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Cambiar estado a: <span className="font-semibold text-blue-600">
                  {estadoConfig[estadoParaVideo as keyof typeof estadoConfig]?.label}
                </span>
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Seleccionar video (máx 50MB)</h3>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith('video/')) { alert('Archivo no es video'); return; }
                    if (file.size > 50 * 1024 * 1024) { alert('Máximo 50MB'); return; }
                    setVideoFile(file);
                    setVideoPreview(URL.createObjectURL(file));
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {videoPreview && (
                <div className="mb-6">
                  <video src={videoPreview} controls className="w-full h-64 rounded-lg bg-black" />
                  <p className="text-sm text-gray-600 mt-2">{videoFile?.name}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    if (!videoFile) { alert('Selecciona un video'); return; }
                    actualizarEstadoConVideo(pedidoParaVideo, estadoParaVideo, videoFile);
                  }}
                  disabled={!videoFile || actualizandoEstado === pedidoParaVideo}
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                >
                  Subir y actualizar
                </button>
                <button
                  onClick={() => {
                    if (videoPreview) URL.revokeObjectURL(videoPreview);
                    setShowVideoModal(false);
                    setVideoPreview(null);
                    setVideoFile(null);
                  }}
                  className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}