// src/services/pedidos.ts

import api from '@/lib/api';

export interface PedidoItem {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: string;
  fecha: string;
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  total_calculado: number;
  observaciones: {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
  };
  pedido_items: PedidoItem[];
  productos?: any[];
}

export class PedidosService {
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    } as Record<string, string>;
  }

  async obtenerPedidos(): Promise<Pedido[]> {
    try {
      const res = await api.get('/productos/admin/pedidos', {
        headers: this.getAuthHeaders(),
      });
      const data = res.data;
      return Array.isArray(data) ? data : data?.data || [];
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error as any;
    }
  }

  async actualizarEstadoPedido(pedidoId: string, nuevoEstado: string, entregaManual?: boolean): Promise<void> {
    try {
      const body: any = { estado: nuevoEstado };
      if (entregaManual) {
        body.entrega_manual = true;
      }

      await api.patch(`/productos/admin/pedidos/${pedidoId}/estado`, body, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error as any;
    }
  }

  async obtenerPedidoPorId(pedidoId: string): Promise<Pedido> {
    try {
      const res = await api.get(`/productos/admin/pedidos/${pedidoId}`, {
        headers: this.getAuthHeaders(),
      });
      return res.data as Pedido;
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error);
      throw error as any;
    }
  }
}

export const pedidosService = new PedidosService();