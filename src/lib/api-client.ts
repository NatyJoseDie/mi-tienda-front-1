// src/lib/api-client.ts
import api from "./api";

// ----- PRODUCTOS -----

/**
 * Obtener todos los productos del catálogo
 */
export async function getProductos() {
  try {
    // Llamada directa al backend usando axios configurado
    const response = await api.get('/catalogo/visual');
    return response.data;
  } catch (err) {
    console.error("Error al obtener productos:", err);
    throw err;
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProductoPorId(id: string) {
  try {
    // Llamada directa al backend usando axios configurado
    const response = await api.get(`/catalogo/producto/${id}`);
    return response.data;
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
    const res = await api.put(`/productos/${id}`, productData);
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

/**
 * Crear pedido de consumidor final
 */
export async function crearPedidoConsumidor(pedidoData: any) {
  try {
    const items = pedidoData.items ?? (pedidoData.productos
      ? pedidoData.productos.map((p: any) => ({
          producto_id: p.producto_id ?? p.id,
          cantidad: p.cantidad ?? p.quantity ?? 1,
        }))
      : []);

    const payload = {
      nombre: pedidoData.nombre,
      email: pedidoData.email,
      telefono: pedidoData.telefono,
      direccion: pedidoData.direccion,
      items,
    };

    const res = await api.post("/usuarios/pedido-consumidor", payload, { timeout: 10000 });
    return res.data;
  } catch (err: any) {
    console.error("Error al crear pedido de consumidor:", {
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    throw err;
  }
}

/**
 * Confirmar recepción de pedido
 */
export async function confirmarRecepcionPedido(pedidoId: string) {
  try {
    const res = await api.post(`/productos/pedidos/${pedidoId}/confirmar-recepcion`);
    return res.data;
  } catch (err) {
    console.error("Error al confirmar recepción de pedido:", err);
    throw err;
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

/**
 * Crear una nueva categoría
 */
export async function crearCategoria(data: {
  nombre: string;
  descripcion?: string;
}) {
  try {
    const res = await api.post("/categorias", data);
    return res.data;
  } catch (err) {
    console.error("Error al crear categoría:", err);
    throw err;
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

// ----- AUTENTICACIÓN -----

/**
 * Solicitar código de activación
 */
export async function solicitarCodigo(data: {
  email: string;
  nombreTienda: string;
  tipoNegocio: string;
  descripcion: string;
}) {
  try {
    const res = await api.post("/auth/solicitar-codigo", data);
    return res.data;
  } catch (err) {
    console.error("Error al solicitar código:", err);
    throw err;
  }
}

/**
 * Validar código de activación
 */
export async function validarCodigo(codigo: string) {
  try {
    const res = await api.post("/auth/validar-codigo", { codigo });
    return res.data;
  } catch (err) {
    console.error("Error al validar código:", err);
    throw err;
  }
}

/**
 * Registrar con código de activación
 */
export async function registrarConCodigo(data: {
  codigo: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion?: string;
  password: string;
}) {
  try {
    const res = await api.post("/auth/register-with-code", data);
    return res.data;
  } catch (err) {
    console.error("Error al registrar con código:", err);
    throw err;
  }
}

// ----- CONTACTO -----

/**
 * Solicitar información de planes
 */
export async function solicitarInfoPlanes(data: {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  planSeleccionado: string;
}) {
  try {
    const res = await api.post("/contacto/solicitar-info", data);
    return res.data;
  } catch (err) {
    console.error("Error al solicitar información:", err);
    throw err;
  }
}

/**
 * Enviar contacto comercial
 */
export async function enviarContactoComercial(data: {
  nombre: string;
  email: string;
  telefono: string;
  tipoNegocio: string;
  descripcion: string;
  presupuesto: string;
}) {
  try {
    const res = await api.post("/contacto-comercial", data);
    return res.data;
  } catch (err) {
    console.error("Error al enviar contacto comercial:", err);
    throw err;
  }
}

/**
 * Obtener estadísticas de seguridad
 */
export async function getSecurityStats() {
  try {
    const res = await api.get("/auth/security-stats");
    return res.data;
  } catch (err) {
    console.error("Error al obtener estadísticas de seguridad:", err);
    throw err;
  }
}

// ----- VENTAS MANUALES -----

/**
 * Crear una venta manual (admin)
 */
export async function crearVentaManual(ventaData: any) {
  try {
    const res = await api.post("/ventas-manuales", ventaData);
    return res.data;
  } catch (err) {
    console.error("Error al crear venta manual:", err);
    throw err;
  }
}