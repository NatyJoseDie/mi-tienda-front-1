// Registro de ventas manuales para administradores.
// Permite ingresar ventas fuera del flujo normal (manuales).

'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProductos, crearVentaManual } from '@/lib/api-client';

type Producto = {
  id: string;
  nombre: string;
  precio_costo: number;
  precio_venta?: number;
  precio_final?: number;
  stock: number;
  descripcion?: string;
  categoria_id: string;
  sku?: string;
  unidad_id?: number;
  categoria?: string;
};

type Item = {
  idRow: string;
  producto_id: string;
  nombre_producto_personalizado?: string;
  cantidad: number;
  precio_venta: number;
  precio_costo_personalizado?: number;
  esPersonalizado: boolean;
};

export default function AdminVentasManuales() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [nombreComprador, setNombreComprador] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [notas, setNotas] = useState('');
  const [factura, setFactura] = useState(false);
  const [items, setItems] = useState<Item[]>([
    { idRow: crypto.randomUUID(), producto_id: '', cantidad: 1, precio_venta: 0, esPersonalizado: false },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos para selector simple
  const cargarProductos = async () => {
    setLoadingProductos(true);
    try {
      // Usar la función centralizada para obtener productos
      const productosData = await getProductos();

      // Normalizar la respuesta del backend
      const mapeados: Producto[] = productosData.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        precio_costo: p.precio_costo || 0,
        precio_venta: p.precio_venta,
        precio_final: p.precio_final,
        stock: p.stock || 0,
        descripcion: p.descripcion,
        categoria_id: p.categoria_id,
        sku: p.sku,
        unidad_id: p.unidad_id,
        categoria: p.categoria
      }));

      setProductos(mapeados);
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      setError(`Error al cargar la lista de productos: ${error?.response?.data?.message || error.message || 'Error desconocido'}`);
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const total = useMemo(() => {
    return items.reduce((s, it) => s + (Number(it.cantidad) || 0) * (Number(it.precio_venta) || 0), 0);
  }, [items]);

  const calcularPrecioFinal = (producto: Producto) => {
    if (!producto) return 0;
    // Usar directamente el precio_final que viene del backend
    // para mantener consistencia con la gestión de productos
    return producto.precio_final || 0;
  };

  const actualizarItem = (idRow: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((it) =>
        it.idRow === idRow ? { ...it, ...patch } : it
      )
    );
  };

  const agregarItem = () => {
    setItems((prev) => [...prev, { 
      idRow: crypto.randomUUID(), 
      producto_id: '', 
      cantidad: 1, 
      precio_venta: 0,
      esPersonalizado: false 
    }]);
  };

  const quitarItem = (idRow: string) => {
    setItems((prev) => prev.filter((it) => it.idRow !== idRow));
  };

  const onChangeProducto = (idx: number, prodId: string) => {
    setItems((prev) => {
      const next = [...prev];
      const prod = productos.find((p) => p.id === prodId);
      
      if (!prod) return next;
      
      const precioVenta = calcularPrecioFinal(prod);
      
      next[idx] = {
        ...next[idx],
        producto_id: prodId,
        precio_venta: precioVenta,
        esPersonalizado: false,
        nombre_producto_personalizado: undefined,
        precio_costo_personalizado: undefined
      };
      
      return next;
    });
  };

  const validar = (): string | null => {
    if (items.length === 0) return 'Agrega al menos un producto';
    for (const [idx, it] of items.entries()) {
      // Validar que tenga producto_id O nombre_producto_personalizado, pero no ambos
      if (it.esPersonalizado) {
        if (!it.nombre_producto_personalizado || it.nombre_producto_personalizado.trim() === '') {
          return `Ingresa el nombre del producto personalizado en la fila ${idx + 1}`;
        }
        if (it.producto_id) {
          return `El producto personalizado en la fila ${idx + 1} no debe tener un producto seleccionado del catálogo`;
        }
      } else {
        if (!it.producto_id) return `Selecciona un producto en la fila ${idx + 1}`;
        if (it.nombre_producto_personalizado) {
          return `El producto del catálogo en la fila ${idx + 1} no debe tener un nombre personalizado`;
        }
      }
      if (!it.cantidad || it.cantidad <= 0) return `Cantidad inválida en la fila ${idx + 1}`;
      if (it.precio_venta == null || it.precio_venta < 0) return `Precio inválido en la fila ${idx + 1}`;
    }
    if (total <= 0) return 'El total debe ser mayor a 0';
    return null;
  };

  const submit = async () => {
    setMensaje(null);
    setError(null);
    const err = validar();
    if (err) {
      setError(err);
      return;
    }

    try {
      setEnviando(true);
      
      // Construir el payload según lo que espera el backend
      const payload = {
        nombre_comprador: nombreComprador || undefined,
        metodo_pago: metodoPago || undefined,
        notas: notas || undefined,
        factura: factura || undefined,
        items: items
          .filter(it => it.esPersonalizado || it.producto_id)
          .map((it) => {
            if (it.esPersonalizado) {
              return {
                nombre_producto_personalizado: it.nombre_producto_personalizado,
                cantidad: Number(it.cantidad),
                precio_venta: Number(it.precio_venta) || 0,
                precio_costo_personalizado: it.precio_costo_personalizado || 0
              };
            } else {
              return {
                producto_id: it.producto_id,
                cantidad: Number(it.cantidad),
                precio_venta: Number(it.precio_venta) || 0,
              };
            }
          }),
      };

      console.log('Enviando venta manual:', payload);

      const { status, data } = await crearVentaManual(payload);

      console.log('Respuesta del servidor:', { status, data });

      // Considerar como éxito cualquier respuesta 2xx
      setMensaje(data?.mensaje || data?.message || 'Venta manual registrada correctamente');
      // Reset
      setNombreComprador('');
      setMetodoPago('');
      setNotas('');
      setFactura(false);
      setItems([{ idRow: crypto.randomUUID(), producto_id: '', cantidad: 1, precio_venta: 0, esPersonalizado: false }]);
    } catch (error: any) {
      console.error('Error al registrar venta manual:', error);
      const text = error?.response?.data?.mensaje || error?.response?.data?.message || error.message;
      setError(text || 'Error al registrar la venta manual');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ventas Manuales</h2>
      <p className="text-gray-600 mb-6">Registra ventas fuera del flujo normal.</p>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 p-3">{error}</div>
      )}
      {mensaje && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-700 p-3">{mensaje}</div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del comprador</label>
            <input
              type="text"
              value={nombreComprador}
              onChange={(e) => setNombreComprador(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
            <input
              type="text"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Efectivo, transferencia, etc."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="factura"
              type="checkbox"
              checked={factura}
              onChange={(e) => setFactura(e.target.checked)}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded"
            />
            <label htmlFor="factura" className="text-sm text-gray-700">Con factura</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Opcional"
            rows={3}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Ítems</h3>
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={it.idRow} className="border p-3 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Producto</label>
                    <select
                      value={it.producto_id}
                      onChange={(e) => onChangeProducto(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Selecciona...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — ${'{'}calcularPrecioFinal(p).toFixed(2){'}'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      value={it.cantidad}
                      onChange={(e) => actualizarItem(it.idRow, { cantidad: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Precio unitario</label>
                    <input
                      type="number"
                      value={it.precio_venta}
                      onChange={(e) => actualizarItem(it.idRow, { precio_venta: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min={0}
                      step={0.01}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarItem(it.idRow, { esPersonalizado: !it.esPersonalizado, producto_id: '', nombre_producto_personalizado: '', precio_costo_personalizado: 0 })}
                      className="px-3 py-2 bg-gray-100 rounded border hover:bg-gray-200 text-sm"
                    >
                      {it.esPersonalizado ? 'Usar del catálogo' : 'Producto personalizado'}
                    </button>
                    <button
                      onClick={() => quitarItem(it.idRow)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded border border-red-300 hover:bg-red-200 text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                {it.esPersonalizado && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Nombre producto</label>
                      <input
                        type="text"
                        value={it.nombre_producto_personalizado || ''}
                        onChange={(e) => actualizarItem(it.idRow, { nombre_producto_personalizado: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Precio costo</label>
                      <input
                        type="number"
                        value={it.precio_costo_personalizado || 0}
                        onChange={(e) => actualizarItem(it.idRow, { precio_costo_personalizado: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Precio venta</label>
                      <input
                        type="number"
                        value={it.precio_venta}
                        onChange={(e) => actualizarItem(it.idRow, { precio_venta: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={agregarItem}
            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Agregar ítem
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold">Total: ${'{'}total.toFixed(2){'}'}</div>
          <button
            onClick={submit}
            disabled={enviando || items.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {enviando ? 'Enviando...' : 'Registrar venta'}
          </button>
        </div>
      </div>
    </div>
  );
}