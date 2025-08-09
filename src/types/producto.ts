// Definiciones de tipos TypeScript para productos
// Se importa en cualquier archivo que necesite usar el tipo Producto para tipar props, datos, etc.

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_costo: number;
  precio_costo_ajustado?: number;
  precio_final?: number;
  stock: number;
  sku?: string;
  imagen_principal?: string;
  activo: boolean;
  destacado?: boolean;
  categoria_id: string;
  categoria?: string;
  unidad_id?: number;
  porcentaje_ganancia?: number;
  porcentaje_aplicado?: number;
  porcentaje_ganancia_individual?: number;
  usa_porcentaje_individual?: boolean;
  imagenes?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type ProductoCarrito = Producto & { quantity: number };