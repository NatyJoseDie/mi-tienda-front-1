// src/lib/api-client.ts
import api from "./api";

// ----- PRODUCTOS -----

/**
 * Obtener todos los productos del catálogo
 */
export async function getProductos() {
  try {
    // Consumimos el proxy interno para evitar CORS en el navegador
    const res = await fetch('/api/catalogo/visual', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error al obtener productos (proxy):", err);
    throw err;
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProductoPorId(id: string) {
  try {
    const res = await api.get(`/catalogo/producto/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al obtener producto:", err);
    return null;
  }
}

/**
 * Crear un producto (admin)
 */
export async function crearProducto(productData: any) {
  try {
    const res = await api.post("/productos", productData);
    return res.data;
  } catch (err) {
    console.error("Error al crear producto:", err);
    throw err;
  }
}

/**
 * Actualizar un producto (admin)
 */
export async function actualizarProducto(id: string, productData: any) {
  try {
    const res = await api.patch(`/productos/${id}`, productData);
    return res.data;
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    throw err;
  }
}

/**
 * Eliminar un producto (admin)
 */
export async function eliminarProducto(id: string) {
  try {
    const res = await api.delete(`/productos/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    throw err;
  }
}

// ----- PEDIDOS -----

/**
 * Crear un pedido
 */
export async function crearPedido(pedidoData: any) {
  try {
    const res = await api.post("/pedidos", pedidoData);
    return res.data;
  } catch (err) {
    console.error("Error al crear pedido:", err);
    throw err;
  }
}

/**
 * Obtener pedidos del usuario
 */
export async function getPedidos() {
  try {
    const res = await api.get("/pedidos");
    return res.data;
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    return [];
  }
}

// ----- CATEGORÍAS -----

/**
 * Obtener todas las categorías
 */
export async function getCategorias() {
  try {
    const res = await api.get("/categorias");
    return res.data;
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    return [];
  }
}

// ----- PRECIOS -----

/**
 * Generar precios para consumidor final (admin)
 */
export async function generarPreciosConsumidorFinal() {
  try {
    const res = await api.post("/precios/generar-consumidor-final");
    return res.data;
  } catch (err) {
    console.error("Error al generar precios:", err);
    throw err;
  }
}