// src/services/catalogo.ts
import api from '@/lib/api';

export interface ActualizarProductoData {
  nombre?: string;
  descripcion?: string;
}

export async function actualizarProductoCatalogo(id: string, datos: ActualizarProductoData) {
  try {
    const response = await api.patch(`/productos/${id}`, datos);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo actualizar el producto');
  }
}

export async function obtenerProductoPorId(id: string) {
  try {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo obtener el producto');
  }
}
