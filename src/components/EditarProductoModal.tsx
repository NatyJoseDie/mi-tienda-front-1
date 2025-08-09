import React, { useState, useEffect } from 'react';
import { actualizarProductoCatalogo, ActualizarProductoData } from '@/services/catalogo';
import { Producto } from '@/types/producto';

interface EditarProductoModalProps {
  abierto: boolean;
  onClose: () => void;
  producto: Producto | null;
  onGuardar: (producto: Producto) => void;
}

export default function EditarProductoModal({ 
  abierto, 
  onClose, 
  producto, 
  onGuardar 
}: EditarProductoModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || '');
      setDescripcion(producto.descripcion || '');
      setError(null);
    }
  }, [producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() && !descripcion.trim()) {
      setError('Debes ingresar al menos un campo.');
      return;
    }

    if (!producto) return;

    try {
      setGuardando(true);
      setError(null);
      
      const datos: ActualizarProductoData = {};
      if (nombre.trim() !== producto.nombre) datos.nombre = nombre.trim();
      if (descripcion.trim() !== (producto.descripcion || '')) datos.descripcion = descripcion.trim();
      
      if (Object.keys(datos).length === 0) {
        onClose();
        return;
      }

      await actualizarProductoCatalogo(producto.id, datos);
      
      // Actualizar el producto local manteniendo todas las propiedades
      const productoActualizado: Producto = {
        ...producto,
        nombre: nombre.trim(),
        descripcion: descripcion.trim()
      };
      
      onGuardar(productoActualizado);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    if (!guardando) {
      onClose();
      setError(null);
    }
  };

  if (!abierto || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">✏️ Editar Producto</h2>
              <p className="text-indigo-100 text-sm mt-1">Actualiza la información básica</p>
            </div>
            <button
              onClick={handleClose}
              disabled={guardando}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Nombre del producto
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa el nombre del producto"
                disabled={guardando}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📄 Descripción
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el producto (opcional)"
                rows={3}
                disabled={guardando}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={guardando}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || (!nombre.trim() && !descripcion.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
