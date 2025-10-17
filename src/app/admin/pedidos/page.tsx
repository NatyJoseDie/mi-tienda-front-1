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
    const session = getSession();
    if (session.token) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setAuthLoading(false);
  }, [router]);

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
}