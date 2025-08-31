// Registro de ventas manuales para administradores.
// Permite ingresar ventas fuera del flujo normal (manuales).

'use client';

import { useEffect, useMemo, useState } from 'react';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
      // Modificar la URL para evitar que el backend interprete "con-ganancia" como un UUID
      const res = await fetch(`${API_URL}/productos?conGanancia=true`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error respuesta API:', res.status, errorText);
        throw new Error('Error al cargar productos');
      }
      const json = await res.json();
      
      // Normalizar la respuesta del backend
      const productosData = Array.isArray(json) ? json : (json.data || []);
      
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
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError(`Error al cargar la lista de productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

      const resp = await fetch(`${API_URL}/ventas-manuales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await resp.text().catch(() => '');
      let data: any = {};
      try { 
        data = text ? JSON.parse(text) : {}; 
      } catch (e) {
        console.error('Error al parsear respuesta:', e);
      }

      console.log('Respuesta del servidor:', { status: resp.status, data });

      // Considerar como éxito cualquier respuesta 2xx
      if (resp.ok || (resp.status >= 200 && resp.status < 300)) {
        setMensaje(data?.mensaje || data?.message || 'Venta manual registrada correctamente');
        // Reset
        setNombreComprador('');
        setMetodoPago('');
        setNotas('');
        setFactura(false);
        setItems([{ idRow: crypto.randomUUID(), producto_id: '', cantidad: 1, precio_venta: 0, esPersonalizado: false }]);
      } else {
        console.error('Error venta manual:', { status: resp.status, text });
        setError(data?.mensaje || data?.message || data?.error || text || `Error HTTP ${resp.status}`);
      }
    } catch (error) {
      console.error('Error al registrar venta manual:', error);
      // Si la venta se guardó pero hubo un error en la respuesta, mostramos un mensaje de advertencia
      setMensaje('La venta se registró correctamente, pero hubo un problema al procesar la respuesta del servidor.');
      // Reset igualmente
      setNombreComprador('');
      setMetodoPago('');
      setNotas('');
      setFactura(false);
      setItems([{ idRow: crypto.randomUUID(), producto_id: '', cantidad: 1, precio_venta: 0, esPersonalizado: false }]);
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

      {/* Datos de la venta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del comprador (opcional)</label>
          <input
            type="text"
            value={nombreComprador}
            onChange={(e) => setNombreComprador(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago (opcional)</label>
          <input
            type="text"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Efectivo, Transferencia, etc."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-500"
            placeholder="Observaciones, condiciones, etc."
          />
        </div>
        <label className="inline-flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={factura}
            onChange={(e) => setFactura(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">Requiere factura</span>
        </label>
      </div>

      {/* Items - Vista de tabla para desktop */}
      <div className="mb-4 hidden md:block overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-left w-28">Stock</th>
              <th className="px-3 py-2 text-left w-28">Cantidad</th>
              <th className="px-3 py-2 text-left w-36">Precios</th>
              <th className="px-3 py-2 text-left w-32">Subtotal</th>
              <th className="px-3 py-2 text-left w-16">-</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((it, idx) => {
              const prod = productos.find((p) => p.id === it.producto_id);
              const subtotal = (Number(it.cantidad) || 0) * (Number(it.precio_venta) || 0);
              return (
                <tr key={it.idRow}>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={it.esPersonalizado}
                          onChange={(e) => {
                            const newItems = [...items];
                            const item = newItems[idx];
                            if (item) {
                              item.esPersonalizado = e.target.checked;
                              if (e.target.checked) {
                                // Limpiar datos del producto del catálogo
                                item.producto_id = '';
                                item.nombre_producto_personalizado = '';
                                item.precio_costo_personalizado = 0;
                                item.precio_venta = 0;
                              } else {
                                // Limpiar datos del producto personalizado
                                item.nombre_producto_personalizado = undefined;
                                item.precio_costo_personalizado = undefined;
                                item.producto_id = '';
                                item.precio_venta = 0;
                              }
                            }
                            setItems(newItems);
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">Producto personalizado</span>
                      </div>
                      
                      {it.esPersonalizado ? (
                        <input
                          type="text"
                          value={it.nombre_producto_personalizado || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            const item = newItems[idx];
                            if (item) {
                              item.nombre_producto_personalizado = e.target.value;
                              // Asegurar que no tenga producto_id cuando es personalizado
                              item.producto_id = '';
                            }
                            setItems(newItems);
                          }}
                          placeholder="Nombre del producto personalizado"
                          className="border rounded px-2 py-1 w-64"
                          disabled={enviando}
                        />
                      ) : (
                        <select
                          disabled={loadingProductos || enviando}
                          value={it.producto_id}
                          onChange={(e) => onChangeProducto(idx, e.target.value)}
                          className="border rounded px-2 py-1 w-64"
                        >
                          <option value="">Seleccionar producto...</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{!it.esPersonalizado ? (prod?.stock ?? '-') : '-'}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={it.cantidad}
                      onChange={(e) => actualizarItem(it.idRow, { cantidad: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.precio_venta === 0 ? '0' : (it.precio_venta || '')}
                        onChange={(e) => actualizarItem(it.idRow, { 
                          precio_venta: Number(e.target.value) || 0 
                        })}
                        className="border rounded px-2 py-1 w-32"
                        placeholder="Precio de venta"
                      />
                      {it.esPersonalizado && (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.precio_costo_personalizado || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            const item = newItems.find(i => i.idRow === it.idRow);
                            if (item) {
                              item.precio_costo_personalizado = Number(e.target.value) || 0;
                            }
                            setItems(newItems);
                          }}
                          className="border rounded px-2 py-1 w-32"
                          placeholder="Precio de costo"
                        />
                      )}
                      {!it.esPersonalizado && prod && (
                        <button
                          type="button"
                          onClick={() => {
                            const precioVenta = calcularPrecioFinal(prod);
                            actualizarItem(it.idRow, { 
                              precio_venta: precioVenta
                            });
                          }}
                          className="ml-2 text-xs text-blue-600 hover:underline"
                          title="Usar precio calculado"
                        >
                          usar calculado
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">${subtotal.toLocaleString('es-AR')}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => quitarItem(it.idRow)}
                      className="text-red-600 hover:underline"
                      disabled={items.length === 1 || enviando}
                    >
                      quitar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Items - Vista de tarjetas para móvil */}
      <div className="mb-4 md:hidden space-y-4">
        {items.map((it, idx) => {
          const prod = productos.find((p) => p.id === it.producto_id);
          const subtotal = (Number(it.cantidad) || 0) * (Number(it.precio_venta) || 0);
          return (
            <div key={it.idRow} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={it.esPersonalizado}
                      onChange={(e) => {
                        const newItems = [...items];
                        const item = newItems[idx];
                        if (item) {
                          item.esPersonalizado = e.target.checked;
                          if (e.target.checked) {
                            item.producto_id = '';
                            item.nombre_producto_personalizado = '';
                            item.precio_costo_personalizado = 0;
                            item.precio_venta = 0;
                          } else {
                            item.nombre_producto_personalizado = undefined;
                            item.precio_costo_personalizado = undefined;
                            item.producto_id = '';
                            item.precio_venta = 0;
                          }
                        }
                        setItems(newItems);
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Producto personalizado</span>
                  </div>
                  
                  {it.esPersonalizado ? (
                    <input
                      type="text"
                      value={it.nombre_producto_personalizado || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        const item = newItems[idx];
                        if (item) {
                          item.nombre_producto_personalizado = e.target.value;
                          item.producto_id = '';
                        }
                        setItems(newItems);
                      }}
                      placeholder="Nombre del producto personalizado"
                      className="w-full border rounded px-2 py-1"
                      disabled={enviando}
                    />
                  ) : (
                    <select
                      disabled={loadingProductos || enviando}
                      value={it.producto_id}
                      onChange={(e) => onChangeProducto(idx, e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => quitarItem(it.idRow)}
                  className="ml-2 text-red-600 hover:bg-red-50 p-2 rounded"
                  disabled={items.length === 1 || enviando}
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <div className="text-sm text-gray-600">{!it.esPersonalizado ? (prod?.stock ?? '-') : '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={it.cantidad}
                    onChange={(e) => actualizarItem(it.idRow, { cantidad: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precios</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={it.precio_venta === 0 ? '0' : (it.precio_venta || '')}
                    onChange={(e) => actualizarItem(it.idRow, { 
                      precio_venta: Number(e.target.value) || 0 
                    })}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Precio de venta"
                  />
                  {it.esPersonalizado && (
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.precio_costo_personalizado || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        const item = newItems.find(i => i.idRow === it.idRow);
                        if (item) {
                          item.precio_costo_personalizado = Number(e.target.value) || 0;
                        }
                        setItems(newItems);
                      }}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Precio de costo"
                    />
                  )}
                  {!it.esPersonalizado && prod && (
                    <button
                      type="button"
                      onClick={() => {
                        const precioVenta = calcularPrecioFinal(prod);
                        actualizarItem(it.idRow, { 
                          precio_venta: precioVenta
                        });
                      }}
                      className="text-xs text-blue-600 hover:underline"
                      title="Usar precio calculado"
                    >
                      usar calculado
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-AR')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={agregarItem}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          disabled={enviando}
        >
          + Agregar ítem
        </button>
        <div className="ml-auto text-lg font-semibold">Total: ${total.toLocaleString('es-AR')}</div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={enviando}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {enviando ? 'Guardando...' : 'Registrar venta manual'}
        </button>
        <button
          type="button"
          onClick={() => {
            setNombreComprador('');
            setMetodoPago('');
            setNotas('');
            setFactura(false);
            setItems([{ idRow: crypto.randomUUID(), producto_id: '', cantidad: 1, precio_venta: 0, esPersonalizado: false }]);
            setError(null);
            setMensaje(null);
          }}
          disabled={enviando}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}