'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type CompraItemInput = {
  id: string; // client-side id
  nombre?: string;
  producto_id?: string;
  cantidad: number;
  precio_unitario: number;
};

type CompraListado = {
  id: string;
  fecha: string;
  proveedor: string;
  observaciones?: string;
  compra_items?: Array<{
    cantidad: number;
    precio_unitario: number;
    productos?: { id: string; nombre: string } | null;
    producto_id?: string;
  }>;
};

export default function AdminCompras() {
  const [proveedor, setProveedor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<CompraItemInput[]>([
    { id: crypto.randomUUID(), nombre: '', producto_id: '', cantidad: 1, precio_unitario: 0 },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [compras, setCompras] = useState<CompraListado[]>([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);

  useEffect(() => {
    cargarCompras();
  }, []);

  async function cargarCompras() {
    try {
      setCargandoCompras(true);
      const res = await fetch(`${API_URL}/compras`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error al cargar compras:', e);
    } finally {
      setCargandoCompras(false);
    }
  }

  function agregarItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nombre: '', producto_id: '', cantidad: 1, precio_unitario: 0 },
    ]);
  }

  function eliminarItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function editarItem(id: string, campo: keyof CompraItemInput, valor: string | number) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [campo]: valor } : it))
    );
  }

  const erroresFormulario = useMemo(() => {
    const errs: string[] = [];
    if (!proveedor.trim()) errs.push('Proveedor es requerido');

    if (items.length === 0) errs.push('Debe agregar al menos un ítem');

    items.forEach((it, idx) => {
      const linea = idx + 1;
      const tieneIdentificador = (it.nombre && it.nombre.trim()) || (it.producto_id && it.producto_id.trim());
      if (!tieneIdentificador) errs.push(`Ítem ${linea}: ingrese nombre o producto_id`);
      if (!Number.isFinite(it.cantidad) || it.cantidad <= 0) errs.push(`Ítem ${linea}: cantidad > 0`);
      if (!Number.isFinite(it.precio_unitario) || it.precio_unitario < 0) errs.push(`Ítem ${linea}: precio_unitario >= 0`);
    });

    return errs;
  }, [proveedor, items]);

  async function registrarCompra() {
    try {
      setError(null);
      if (erroresFormulario.length > 0) {
        setError(erroresFormulario[0]);
        return;
      }
      setEnviando(true);

      const payload = {
        proveedor: proveedor.trim(),
        observaciones: observaciones.trim() || undefined,
        productos: items.map((it) => ({
          nombre: it.nombre?.trim() || undefined,
          producto_id: it.producto_id?.trim() || undefined,
          cantidad: Number(it.cantidad),
          precio_unitario: Number(it.precio_unitario),
        })),
      };

      const res = await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Fallo registrar compra:', { status: res.status, text });
        setError(`No se pudo registrar la compra (HTTP ${res.status})`);
        return;
      }

      // Reset form
      setProveedor('');
      setObservaciones('');
      setItems([{ id: crypto.randomUUID(), nombre: '', producto_id: '', cantidad: 1, precio_unitario: 0 }]);

      await cargarCompras();
      alert('✅ Compra registrada correctamente');
    } catch (e: any) {
      console.error(e);
      setError('Error de conexión');
    } finally {
      setEnviando(false);
    }
  }

  function totalItems() {
    return items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0), 0);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
        <p className="text-gray-600 mt-1">Registrar compras de proveedores y consultar historial</p>
      </div>

      {/* Formulario Registro */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar compra</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <input
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Proveedor S.A."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Factura, OC, notas..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Producto ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Cantidad</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Precio unit.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Subtotal</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 min-w-[220px]">
                    <input
                      value={it.nombre || ''}
                      onChange={(e) => editarItem(it.id, 'nombre', e.target.value)}
                      placeholder="Tornillo 6mm"
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 min-w-[220px]">
                    <input
                      value={it.producto_id || ''}
                      onChange={(e) => editarItem(it.id, 'producto_id', e.target.value)}
                      placeholder="uuid existente (opcional)"
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 w-[120px]">
                    <input
                      type="number"
                      min={1}
                      value={it.cantidad}
                      onChange={(e) => editarItem(it.id, 'cantidad', Number(e.target.value))}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 w-[160px]">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={it.precio_unitario}
                      onChange={(e) => editarItem(it.id, 'precio_unitario', Number(e.target.value))}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${(Number(it.cantidad) * Number(it.precio_unitario) || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => eliminarItem(it.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={agregarItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            <PlusIcon className="w-5 h-5" /> Agregar ítem
          </button>
          <div className="text-right text-gray-800">
            <div className="text-sm">Total</div>
            <div className="text-2xl font-bold">${totalItems().toLocaleString('es-AR')}</div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {erroresFormulario.length > 0 && !error && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            • {erroresFormulario[0]}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={registrarCompra}
            disabled={enviando}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
          >
            {enviando ? 'Enviando…' : 'Registrar compra'}
          </button>
          <button
            onClick={cargarCompras}
            disabled={cargandoCompras}
            className="px-6 py-3 rounded-lg border hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${cargandoCompras ? 'animate-spin' : ''}`} />
            Refrescar listado
          </button>
        </div>
      </div>

      {/* Listado de compras */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Compras recientes</h2>
          <button
            onClick={cargarCompras}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${cargandoCompras ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Proveedor</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Observaciones</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600">Ítems</th>
                <th className="px-6 py-3 text-right font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compras.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {cargandoCompras ? 'Cargando…' : 'Sin compras registradas'}
                  </td>
                </tr>
              )}
              {compras.map((c) => {
                const total = (c.compra_items || []).reduce(
                  (acc, it) => acc + Number(it.cantidad || 0) * Number(it.precio_unitario || 0),
                  0
                );
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{new Date(c.fecha).toLocaleString('es-AR')}</td>
                    <td className="px-6 py-3">{c.proveedor}</td>
                    <td className="px-6 py-3">{c.observaciones || '-'}</td>
                    <td className="px-6 py-3">
                      <ul className="list-disc ml-5">
                        {(c.compra_items || []).map((ci, idx) => (
                          <li key={idx}>
                            {ci.productos?.nombre || ci.producto_id || 'Producto'} × {ci.cantidad} @ ${ci.precio_unitario}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">${total.toLocaleString('es-AR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}