// src/services/pedidos.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

import { authService } from './auth';

export class PedidosService {
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  async obtenerPedidos(): Promise<Pedido[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/admin/pedidos`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Incluir cookies
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }

  async actualizarEstadoPedido(pedidoId: string, nuevoEstado: string, entregaManual?: boolean): Promise<void> {
    try {
      const body: any = { estado: nuevoEstado };
      if (entregaManual) {
        body.entrega_manual = true;
      }

      const response = await fetch(`${API_BASE_URL}/productos/admin/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Incluir cookies
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  async obtenerPedidoPorId(pedidoId: string): Promise<Pedido> {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/admin/pedidos/${pedidoId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Incluir cookies
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error);
      throw error;
    }
  }
}

export const pedidosService = new PedidosService();