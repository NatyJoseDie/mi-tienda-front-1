// src/hooks/usePedidos.ts

import { useState, useEffect } from 'react';
import axios from 'axios';
import { pedidosService, Pedido } from '@/services/pedidos';

export const usePedidos = (options?: { autoLoad?: boolean }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState<string | null>(null);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const pedidosData = await pedidosService.obtenerPedidos();
      setPedidos(pedidosData);
    } catch (error: any) {
      // Ignorar cancelaciones de axios (por ejemplo, al redirigir a login)
      if (axios.isCancel?.(error)) {
        setLoading(false);
        return;
      }
      console.error('Error al cargar pedidos:', error);
      setError(error.message || 'Error al cargar pedidos');
      
      // Si es un error de conexión, mostrar mensaje más específico
      if (error.message?.includes('fetch')) {
        setError('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
      } else if (error.message?.includes('401') || error?.response?.status === 401) {
        setError('No tienes permisos para ver los pedidos. Verifica tu autenticación.');
      } else if (error.message?.includes('404') || error?.response?.status === 404) {
        setError('El endpoint de pedidos no existe. Verifica la configuración del backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (pedidoId: string, nuevoEstado: string, entregaManual?: boolean, videoFile?: File) => {
    try {
      setActualizandoEstado(pedidoId);
      setError(null);
      
      await pedidosService.actualizarEstadoPedido(pedidoId, nuevoEstado, entregaManual, videoFile);
      await cargarPedidos(); // Recargar lista
      
      return { success: true, message: `Pedido actualizado a: ${nuevoEstado}` };
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      const errorMessage = error.message || 'Error al actualizar pedido';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setActualizandoEstado(null);
    }
  };

  const obtenerPedidoPorId = async (pedidoId: string) => {
    try {
      setError(null);
      return await pedidosService.obtenerPedidoPorId(pedidoId);
    } catch (error: any) {
      console.error('Error al obtener pedido:', error);
      setError(error.message || 'Error al obtener pedido');
      throw error;
    }
  };

  // Cargar pedidos automáticamente solo cuando se solicite
  const shouldAutoLoad = options?.autoLoad ?? true;
  useEffect(() => {
    if (shouldAutoLoad) {
      cargarPedidos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoLoad]);

  return {
    pedidos,
    loading,
    error,
    actualizandoEstado,
    cargarPedidos,
    actualizarEstado,
    obtenerPedidoPorId,
    clearError: () => setError(null)
  };
};