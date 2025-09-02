'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';


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
      const { data } = await api.get('/compras');
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

      const { status } = await api.post('/compras', payload);

      // Reset form
      setProveedor('');
      setObservaciones('');
      setItems([{ id: crypto.randomUUID(), nombre: '', producto_id: '', cantidad: 1, precio_unitario: 0 }]);

      await cargarCompras();
      alert('✅ Compra registrada correctamente');
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'Error de conexión');
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
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 text-left">Producto/Nombre</th>
                <th className="px-3 py-2 text-left w-28">Cantidad</th>
                <th className="px-3 py-2 text-left w-28">Precio</th>
                <th className="px-3 py-2 text-left w-28">Subtotal</th>
                <th className="px-3 py-2 text-left w-16">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        placeholder="Nombre manual (opcional)"
                        value={it.nombre || ''}
                        onChange={(e) => editarItem(it.id, 'nombre', e.target.value)}
                        className="border rounded px-2 py-1 w-64"
                      />
                      <span className="text-xs text-gray-500">o</span>
                      <input
                        placeholder="producto_id"
                        value={it.producto_id || ''}
                        onChange={(e) => editarItem(it.id, 'producto_id', e.target.value)}
                        className="border rounded px-2 py-1 w-48"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={it.cantidad}
                      onChange={(e) => editarItem(it.id, 'cantidad', Number(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={it.precio_unitario}
                      onChange={(e) => editarItem(it.id, 'precio_unitario', Number(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    ${(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => eliminarItem(it.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={agregarItem}
                        className="text-gray-700 hover:bg-gray-50 p-2 rounded"
                        title="Agregar"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-xl font-semibold">Total: ${totalItems().toFixed(2)}</div>
          <button
            onClick={registrarCompra}
            disabled={enviando}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {enviando ? 'Guardando...' : 'Registrar compra'}
          </button>
        </div>
      </div>

      {/* Listado de compras */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Compras recientes</h2>
          <button
            onClick={cargarCompras}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Proveedor</th>
                <th className="px-3 py-2 text-left">Observaciones</th>
                <th className="px-3 py-2 text-left">Ítems</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compras.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2">{new Date(c.fecha).toLocaleString()}</td>
                  <td className="px-3 py-2">{c.proveedor}</td>
                  <td className="px-3 py-2">{c.observaciones || '-'}</td>
                  <td className="px-3 py-2">
                    <ul className="list-disc list-inside space-y-1">
                      {c.compra_items?.map((it, idx) => (
                        <li key={idx}>
                          {it.productos?.nombre || it.producto_id || it.cantidad} x ${it.precio_unitario}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cargandoCompras && (
          <div className="text-sm text-gray-500 mt-2">Cargando compras...</div>
        )}
      </div>
    </div>
  );
}