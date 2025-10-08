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
import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    pedidos,
    loading,
    error,
    actualizandoEstado,
    cargarPedidos,
    actualizarEstado: actualizarEstadoPedido,
    clearError
  } = usePedidos({ autoLoad: isAuthenticated });

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
    const session = getSession();
    const token = session.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    setIsAuthenticated(Boolean(token));
    setAuthLoading(false);
  }, []);

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

      const response = await api.put(`/productos/admin/pedidos/${pedidoId}/estado`, formData);

      if (response.status >= 200 && response.status < 300) {
        await cargarPedidos();
        alert(`✅ Pedido actualizado a: ${estadoConfig[nuevoEstado as keyof typeof estadoConfig]?.label}`);
        // Limpiar estado del video
        setVideoFile(null);
        setVideoPreview(null);
        setShowVideoModal(false);
      } else {
        console.error('Actualizar estado (con video) fallo:', { status: response.status });
        alert(`❌ Error al actualizar el pedido (HTTP ${response.status})`);
      }
    } catch (error: any) {
      console.error('Error al actualizar estado con video:', error);
      alert(`❌ Error al actualizar el pedido: ${error?.response?.data?.message || 'Error de conexión'}`);
    }
  };

  // Abrir modal para seleccionar video y confirmar
  const abrirVideoModal = (pedidoId: string) => {
    setPedidoParaVideo(pedidoId);
    setEstadoParaVideo('enviado');
    setVideoFile(null);
    setVideoPreview(null);
    setShowVideoModal(true);
  };

  const onVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    setVideoPreview(file ? URL.createObjectURL(file) : null);
  };

  const confirmarVideo = async () => {
    if (!pedidoParaVideo || !estadoParaVideo || !videoFile) {
      setShowVideoModal(false);
      return;
    }
    await actualizarEstadoConVideo(pedidoParaVideo, estadoParaVideo, videoFile);
  };

  // ----------- UI PRINCIPAL -----------
  const pedidosFiltrados = filtroEstado
    ? pedidos.filter(p => p.estado === (filtroEstado as any))
    : pedidos;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
        <button
          onClick={cargarPedidos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Recargar
        </button>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700">
          No estás autenticado. Inicia sesión para ver pedidos. Si ya iniciaste sesión y sigues viendo este mensaje, intenta refrescar la página.
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Filtrar por estado:</label>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="preparando">Preparando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-600 hover:underline text-sm">Ocultar</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Cargando pedidos...</span>
        </div>
      )}

      {/* Vacío */}
      {!loading && pedidosFiltrados.length === 0 && (
        <div className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-6">
          No hay pedidos para mostrar.
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosFiltrados.map((pedido) => {
          const estadoConf = estadoConfig[pedido.estado as keyof typeof estadoConfig];
          const EstadoIcon = estadoConf.icon;
          return (
            <div key={pedido.id} className="border rounded-lg bg-white shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EstadoIcon className="h-5 w-5 text-gray-600" />
                  <span className={`text-xs px-2 py-1 rounded ${estadoConf.color}`}>{estadoConf.label}</span>
                </div>
                <span className="text-xs text-gray-500">ID: {pedido.id}</span>
              </div>

              <div className="p-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{new Date(pedido.fecha).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                  <span>Total: ${pedido.total ?? pedido.total_calculado ?? 0}</span>
                </div>
                {pedido.observaciones?.nombre && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span>{pedido.observaciones.nombre}</span>
                  </div>
                )}

                {/* Items básicos */}
                {pedido.pedido_items?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Items:</p>
                    <ul className="text-xs list-disc list-inside space-y-1">
                      {pedido.pedido_items.slice(0, 4).map((it) => (
                        <li key={it.id}>x{it.cantidad} · {it.producto_id}</li>
                      ))}
                      {pedido.pedido_items.length > 4 && (
                        <li className="text-gray-400">… {pedido.pedido_items.length - 4} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={!!entregaManualMap[pedido.id]}
                      onChange={(e) => setEntregaManualMap((prev) => ({ ...prev, [pedido.id]: e.target.checked }))}
                    />
                    Entrega manual/externa
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => actualizarEstado(pedido.id, 'confirmado')}
                    disabled={actualizandoEstado === pedido.id}
                  >Confirmar</button>
                  <button
                    className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => actualizarEstado(pedido.id, 'preparando')}
                    disabled={actualizandoEstado === pedido.id}
                  >Preparar</button>
                  <button
                    className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => actualizarEstado(pedido.id, 'enviado')}
                    disabled={actualizandoEstado === pedido.id}
                  >Enviar</button>
                  <button
                    className="px-3 py-1 text-xs rounded bg-indigo-700 text-white hover:bg-indigo-800"
                    onClick={() => abrirVideoModal(pedido.id)}
                    disabled={actualizandoEstado === pedido.id}
                  >Enviar (video)</button>
                  <button
                    className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => actualizarEstado(pedido.id, 'entregado')}
                    disabled={actualizandoEstado === pedido.id}
                  >Entregar</button>
                  {/* El backend solo acepta video cuando estado === 'enviado' */}
                  <button
                    className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => actualizarEstado(pedido.id, 'cancelado')}
                    disabled={actualizandoEstado === pedido.id}
                  >Cancelar</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-3">Adjuntar evidencia en video</h2>
            <p className="text-sm text-gray-600 mb-4">Selecciona un archivo de video para adjuntar al cambio de estado.</p>
            <input type="file" accept="video/*" onChange={onVideoSelected} className="mb-3" />
            {videoPreview && (
              <video src={videoPreview} controls className="w-full rounded-md mb-3" />
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setShowVideoModal(false)}
              >Cancelar</button>
              <button
                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirmarVideo}
                disabled={!videoFile}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}