// Definiciones de tipos TypeScript para productos
// Se importa en cualquier archivo que necesite usar el tipo Producto para tipar props, datos, etc.

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string; // Cambiar de opcional a requerido
  precio_costo: number; // Cambiar de opcional a requerido
  precio_final?: number;
  stock: number;
  sku?: string;
  imagen_principal?: string;
  activo: boolean;
  categoria_id: string; // Cambiar de number? a string (requerido)
  categoria?: string; // Mantener por compatibilidad
  unidad_id?: number; // Agregar este campo que faltaba
  porcentaje_ganancia?: number;
  porcentaje_aplicado?: number;
  porcentaje_ganancia_individual?: number;
  usa_porcentaje_individual?: boolean;
  imagenes?: string[];
  destacado?: boolean; // Campo para productos destacados
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type ProductoCarrito = Producto & { quantity: number };