// src/hooks/usePedidos.ts

import { useState, useEffect } from 'react';
import { pedidosService, Pedido } from '@/services/pedidos';

export const usePedidos = () => {
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
      console.error('Error al cargar pedidos:', error);
      setError(error.message || 'Error al cargar pedidos');
      
      // Si es un error de conexión, mostrar mensaje más específico
      if (error.message?.includes('fetch')) {
        setError('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
      } else if (error.message?.includes('401')) {
        setError('No tienes permisos para ver los pedidos. Verifica tu autenticación.');
      } else if (error.message?.includes('404')) {
        setError('El endpoint de pedidos no existe. Verifica la configuración del backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (pedidoId: string, nuevoEstado: string, entregaManual?: boolean) => {
    try {
      setActualizandoEstado(pedidoId);
      setError(null);
      
      await pedidosService.actualizarEstadoPedido(pedidoId, nuevoEstado, entregaManual);
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

  useEffect(() => {
    cargarPedidos();
  }, []);

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