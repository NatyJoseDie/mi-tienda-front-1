// src/services/catalogo.ts
import api from '@/lib/api';

export interface ActualizarProductoData {
  nombre?: string;
  descripcion?: string;
}

export async function actualizarProductoCatalogo(id: string, datos: ActualizarProductoData) {
  try {
    // El backend espera multipart/form-data, no JSON
    const formData = new FormData();
    
    if (datos.nombre !== undefined) {
      formData.append('nombre', datos.nombre);
    }
    if (datos.descripcion !== undefined) {
      formData.append('descripcion', datos.descripcion);
    }
    
    const response = await api.put(`/productos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
