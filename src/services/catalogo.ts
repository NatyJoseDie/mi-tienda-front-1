// src/services/catalogo.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ActualizarProductoData {
  nombre?: string;
  descripcion?: string;
}

export async function actualizarProductoCatalogo(id: string, datos: ActualizarProductoData) {
  const response = await fetch(`${API_BASE_URL}/catalogo/producto/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'No se pudo actualizar el producto');
  }
  
  return response.json();
}

export async function obtenerProductoPorId(id: string) {
  const response = await fetch(`${API_BASE_URL}/catalogo/producto/${id}`);
  
  if (!response.ok) {
    throw new Error('No se pudo obtener el producto');
  }
  
  return response.json();
}
