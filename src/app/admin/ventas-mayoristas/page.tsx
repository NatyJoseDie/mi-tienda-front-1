'use client';

import { useEffect, useState } from 'react';

interface Producto {
  id: string;
  nombre: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  precio_final?: number;
}

interface VentaMayorista {
  id: string;
  fecha: string;
  producto_id: string;
  cantidad: number;
  costo_unitario: number;
  precio_venta: number;
  ganancia_total: number;
  nombre_tienda: string;
  metodo_pago?: string;
  notas?: string;
  factura?: boolean;
  productos?: { nombre: string };
}

export default function AdminVentasMayoristas() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<VentaMayorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarVentas, setMostrarVentas] = useState(false);

  // Form state
  const [productoId, setProductoId] = useState('');
  const [productoSel, setProductoSel] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [nombreTienda, setNombreTienda] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [notas, setNotas] = useState('');

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos?conGanancia=true`, {
        credentials: 'include' // Incluir cookies
      });
      if (!res.ok) throw new Error('Error cargando productos');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data ?? []);
      setProductos(arr);
    } catch (e) {
      console.error('No se pudieron cargar los productos', e);
      setProductos([]);
    }
  };

  const cargarPrecioSugerido = async (productoId: string) => {
    try {
      const res = await fetch(`${API_URL}/ventas/mayoristas/precio-sugerido/${productoId}`, {
        credentials: 'include' // Incluir cookies
      });
      if (res.ok) {
        const data = await res.json();
        // data contiene: precio_costo, precio_mayorista_sugerido, ganancia_porcentaje, stock_disponible
        setPrecioVenta(data.precio_mayorista_sugerido || 0);
        return data;
      }
    } catch (e) {
      console.warn('No se pudo obtener precio sugerido', e);
    }
    return null;
  };

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/ventas/mayoristas`, {
        credentials: 'include' // Incluir cookies
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data ?? data.results ?? data.items ?? []);
      setVentas(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.warn('No se pudieron cargar las ventas mayoristas', e);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarVentas();
  }, []);

  useEffect(() => {
    if (mostrarVentas) cargarVentas();
  }, [mostrarVentas]);

  useEffect(() => {
    const p = productos.find((x) => x.id === productoId) || null;
    setProductoSel(p);
    if (p) {
      // Primero intentamos obtener el precio sugerido desde el nuevo endpoint
      cargarPrecioSugerido(p.id).then((precioData) => {
        if (!precioData) {
          // Fallback al precio del producto si no hay endpoint
          setPrecioVenta(p.precio_final ?? p.precio_venta ?? 0);
        }
      });
    }
  }, [productoId, productos]);

  const registrarVenta = async () => {
    if (!productoSel || cantidad <= 0 || !nombreTienda.trim()) {
      alert('Completa producto, cantidad y nombre de tienda');
      return;
    }
    if (cantidad > (productoSel?.stock ?? 0)) {
      alert(`Stock insuficiente. Disponible: ${productoSel?.stock ?? 0}`);
      return;
    }

    try {
      setLoading(true);
      const body: any = {
        producto_id: productoSel.id,
        cantidad,
        nombre_tienda: nombreTienda,
        metodo_pago: metodoPago || undefined,
        notas: notas || undefined,
      };
      
      // Solo incluir precio_venta si el usuario lo modificó manualmente
      // Si está en 0 o es el precio sugerido, dejamos que el backend calcule automáticamente
      if (precioVenta > 0) {
        body.precio_venta = precioVenta;
      }

      const res = await fetch(`${API_URL}/ventas/mayoristas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Error registrando la venta');
      }
      alert('Venta mayorista registrada correctamente con precio automático (30% ganancia)');
      // limpiar
      setProductoId('');
      setCantidad(1);
      setPrecioVenta(0);
      setNombreTienda('');
      setMetodoPago('');
      setNotas('');
      cargarVentas();
      setMostrarVentas(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      const res = await fetch(`${API_URL}/ventas/mayoristas/exportar-excel`, {
        credentials: 'include' // Incluir cookies
      });
      if (!res.ok) throw new Error('No se pudo exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ventas-mayoristas.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error al exportar a Excel');
    }
  };

  if (loading && productos.length === 0 && ventas.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center text-gray-600">Cargando…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ventas Mayoristas</h1>
      <p className="text-gray-600 mb-6">Registra ventas a clientes mayoristas y consulta el historial.</p>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setMostrarVentas(false)} className={`px-4 py-2 rounded ${!mostrarVentas ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Registrar Venta</button>
        <button onClick={() => setMostrarVentas(true)} className={`px-4 py-2 rounded ${mostrarVentas ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Ver Ventas</button>
      </div>

      {!mostrarVentas ? (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar…</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta (unidad)</label>
              <input type="number" min={0} step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(Number(e.target.value))} className="w-full border rounded px-3 py-2" placeholder="Precio automático con 30% ganancia" />
              {productoSel && (
                <div className="text-xs text-gray-500 mt-1">
                  <p>Costo: ${productoSel.precio_costo.toLocaleString()}</p>
                  <p className="text-green-600 font-medium">Precio mayorista automático: ${Math.round(productoSel.precio_costo * 1.3).toLocaleString()} (30% ganancia)</p>
                  <p className="text-blue-600">Deja vacío para usar precio automático o ingresa uno personalizado</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la tienda</label>
              <input type="text" value={nombreTienda} onChange={(e) => setNombreTienda(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Distribuidora XYZ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago (opcional)</label>
              <input type="text" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Transferencia, Efectivo…" />
              <p className="text-xs text-gray-500 mt-1">Si no es "Efectivo", el backend marcará la venta con factura.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={registrarVenta} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Registrando…' : 'Registrar Venta (30% Ganancia Automática)'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Historial de Ventas Mayoristas</h2>
            <button onClick={exportarExcel} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Exportar Excel</button>
          </div>

          {ventas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Fecha</th>
                    <th className="border border-gray-300 p-2 text-left">Producto</th>
                    <th className="border border-gray-300 p-2 text-left">Cantidad</th>
                    <th className="border border-gray-300 p-2 text-left">Precio</th>
                    <th className="border border-gray-300 p-2 text-left">Total</th>
                    <th className="border border-gray-300 p-2 text-left">Tienda</th>
                    <th className="border border-gray-300 p-2 text-left">Método Pago</th>
                    <th className="border border-gray-300 p-2 text-left">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id}>
                      <td className="border border-gray-300 p-2">{new Date(v.fecha).toLocaleDateString()}</td>
                      <td className="border border-gray-300 p-2">{v.productos?.nombre || 'Desconocido'}</td>
                      <td className="border border-gray-300 p-2">{v.cantidad}</td>
                      <td className="border border-gray-300 p-2">${v.precio_venta.toLocaleString()}</td>
                      <td className="border border-gray-300 p-2">${(v.cantidad * v.precio_venta).toLocaleString()}</td>
                      <td className="border border-gray-300 p-2">{v.nombre_tienda}</td>
                      <td className="border border-gray-300 p-2">{v.metodo_pago || '-'}</td>
                      <td className="border border-gray-300 p-2">{v.factura ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}