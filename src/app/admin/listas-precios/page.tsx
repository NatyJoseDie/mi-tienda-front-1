'use client';

import { useEffect, useState } from 'react';
import { Producto } from '@/types/producto';
import ProductForm from '@/components/products/ProductForm';
import Modal from '@/components/products/Modal';
import AjustePrecioCosto from '../productos/AjustePrecioCosto';
import { getProductos } from '@/lib/api-client';
import Link from 'next/link';

const STOCK_CRITICO = 5;
// API_URL ya no es necesario - usando cliente API centralizado

export default function AdminListasPrecios() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Producto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductos();
      const productosData = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setProductos(productosData);
    } catch (err: any) {
      console.error('Error en fetchProductos:', err);
      setError(err.message || 'Error desconocido');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleSave = async (formData: FormData) => {
    try {
      const { default: api } = await import('@/lib/api');
      const isEdit = !!editData;
      
      console.log('Enviando datos:', Object.fromEntries(formData.entries()));
      
      let response;
      if (isEdit) {
        // En edición: usar PUT con FormData según contrato del backend
        // Construir FormData sólo con campos permitidos y enviar imágenes si fueron provistas
        const updateFd = new FormData();

        // Helper: agrega valores simples como string y complejos (arrays/objetos) serializados
        const appendSmart = (key: string, value: any) => {
          if (value === undefined || value === null || value === '') return;
          if (value instanceof File || value instanceof Blob) {
            updateFd.append(key, value);
          } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            updateFd.append(key, JSON.stringify(value));
          } else {
            updateFd.append(key, String(value));
          }
        };

        // Helper para agregar solo si cambió
        const appendIfChanged = (key: string, newValue: FormDataEntryValue | null, originalValue: any) => {
          if (!newValue || newValue === '') return;

          let parsedNew: string | number = typeof originalValue === 'number' ? Number(newValue) : String(newValue);

          let parsedOriginal = originalValue ?? (typeof parsedNew === 'number' ? 0 : '');

          if (parsedNew !== parsedOriginal) {
            appendSmart(key, parsedNew);
          }
        };

        // Campos básicos permitidos, solo si cambiaron
        appendIfChanged('nombre', formData.get('nombre'), editData!.nombre);
        appendIfChanged('descripcion', formData.get('descripcion'), editData!.descripcion);
        appendIfChanged('precio_costo', formData.get('precio_costo'), editData!.precio_costo);
        appendIfChanged('stock', formData.get('stock'), editData!.stock);
        appendIfChanged('categoria', formData.get('categoria'), editData!.categoria);
        appendIfChanged('unidad_id', formData.get('unidad_id'), editData!.unidad_id);
        // Importante: No enviar SKU durante la edición para evitar errores de validación

        // Imágenes (opcional), agregar si se proporcionaron
        const imagenesVals = formData.getAll('imagenes').filter((v) => v instanceof File);
        if (imagenesVals.length > 0) {
          imagenesVals.forEach((img) => updateFd.append('imagenes', img as File));
        }

        // Debug: listar el contenido final del FormData a enviar
        try {
          console.log('PUT /productos/' + editData!.id + ' payload (FormData):');
          for (const [k, v] of updateFd.entries()) {
            if (v instanceof File) {
              console.log(`  ${k}: File(name=${v.name}, size=${v.size}, type=${v.type})`);
            } else {
              console.log(`  ${k}:`, v);
            }
          }
        } catch (e) { /* noop */ }

        // Actualizar datos del producto
        response = await api.put(`/productos/${editData!.id}`, updateFd);
      } else {
        // En creación: el backend acepta multipart/form-data con todos los campos
        response = await api.post('/productos', formData);
      }
      
      const nuevoProducto = Array.isArray(response.data) ? response.data[0] : response.data.data?.[0] || response.data;
      
      console.log('Producto procesado:', nuevoProducto);

      setModalOpen(false);
      setEditData(null);
      if (isEdit) {
        setProductos(prev => prev.map(p => p.id === nuevoProducto.id ? { ...p, ...nuevoProducto } : p));
      } else {
        setProductos(prev => [nuevoProducto, ...prev]);
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const { default: api } = await import('@/lib/api');
      await api.delete(`/productos/${deleteId}`);
      setProductos(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error desconocido');
    } finally {
      setDeleteLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lista de Precios</h2>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-md px-3 py-1.5">
          ← Volver al menú principal
        </Link>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <AjustePrecioCosto onAjusteGuardado={fetchProductos} />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border px-4 py-2 rounded w-1/2"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => { setEditData(null); setModalOpen(true); }}>+ Nuevo producto</button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando productos...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center text-gray-500">No se encontraron productos.</div>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2">Imagen</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Precio de Costo</th>
                  <th className="px-4 py-2 text-indigo-700 bg-indigo-50">Costo Ajustado</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Descripción corta</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((prod, idx) => (
                  <tr key={prod.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">
                      {prod.imagen_principal ? (
                        <img
                          src={prod.imagen_principal.startsWith('http') ? prod.imagen_principal : `${process.env.NEXT_PUBLIC_API_URL}${prod.imagen_principal}`}
                          alt={prod.nombre}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      ) : (
                        <span className="text-gray-400">Sin imagen</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{prod.nombre}</td>
                    <td className="px-4 py-2">{prod.sku || '-'}</td>
                    <td className="px-4 py-2">${prod.precio_costo?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 font-bold bg-gray-100">${prod.precio_costo_ajustado?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) ?? 'N/A'}</td>
                    <td className="px-4 py-2">
                      {prod.stock}
                      {prod.stock <= STOCK_CRITICO && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Crítico</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{prod.descripcion || '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition text-xs" onClick={() => { setEditData(prod); setModalOpen(true); }}>Editar</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs" onClick={() => setDeleteId(prod.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para móvil */}
          <div className="md:hidden space-y-4">
            {productosFiltrados.map((prod) => (
              <div key={prod.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {prod.imagen_principal ? (
                      <img
                        src={prod.imagen_principal.startsWith('http') ? prod.imagen_principal : `${process.env.NEXT_PUBLIC_API_URL}${prod.imagen_principal}`}
                        alt={prod.nombre}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{prod.nombre}</h3>
                    <p className="text-xs text-gray-500">SKU: {prod.sku || '-'}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{prod.descripcion || '-'}</p>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Costo:</span>
                    <p className="font-medium">${prod.precio_costo?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Ajustado:</span>
                    <p className="font-bold text-indigo-600">${prod.precio_costo_ajustado?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) ?? 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Stock:</span>
                    <p className={`font-medium ${prod.stock <= STOCK_CRITICO ? 'text-red-600' : ''}`}>
                      {prod.stock}
                      {prod.stock <= STOCK_CRITICO && (
                        <span className="ml-1 text-xs text-red-600">Crítico</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button 
                    className="flex-1 bg-yellow-400 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-500 transition"
                    onClick={() => { setEditData(prod); setModalOpen(true); }}
                  >
                    Editar
                  </button>
                  <button 
                    className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition"
                    onClick={() => setDeleteId(prod.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }}>
        <ProductForm
          initialData={editData || {}}
          onSubmitAction={handleSave}
          onCancelAction={() => { setModalOpen(false); setEditData(null); }}
        />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="text-center">
          <h3 className="text-lg font-bold mb-4">¿Eliminar producto?</h3>
          <p className="mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancelar</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}