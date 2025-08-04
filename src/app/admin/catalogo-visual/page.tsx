'use client';

import { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  PlusIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ProductoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen_principal: string | null;
  imagenes: string[];
  stock: number;
  precio_final: number | null;
  destacado?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminCatalogoVisual() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductoCatalogo | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

  useEffect(() => {
    cargarCatalogoVisual();
  }, []);

  const cargarCatalogoVisual = async () => {
    try {
      const response = await fetch(`${API_URL}/catalogo/visual`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      } else {
        console.error('Error al obtener catálogo visual:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDestacar = async (productId: string, destacado: boolean) => {
    try {
      const response = await fetch(`${API_URL}/productos/${productId}/destacar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destacado }),
      });

      if (response.ok) {
        setProductos(prev => prev.map(p => 
          p.id === productId ? { ...p, destacado } : p
        ));
        alert(destacado ? 'Producto destacado correctamente' : 'Producto quitado de destacados');
      } else {
        alert('Error al actualizar el estado de destacado');
      }
    } catch (error) {
      console.error('Error al destacar producto:', error);
      alert('Error al actualizar el estado de destacado');
    }
  };

  const actualizarImagenPrincipal = async (productId: string, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const response = await fetch(`${API_URL}/catalogo/producto/${productId}/imagen-principal`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        await cargarCatalogoVisual();
        alert('Imagen principal actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      alert('Error al actualizar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const agregarImagenes = async (productId: string, files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('imagenes', file);
      });

      const response = await fetch(`${API_URL}/catalogo/producto/${productId}/imagenes`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await cargarCatalogoVisual();
        alert('Imágenes agregadas correctamente');
      }
    } catch (error) {
      console.error('Error al agregar imágenes:', error);
      alert('Error al agregar las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const eliminarImagen = async (productId: string, imagen: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      const response = await fetch(`${API_URL}/catalogo/producto/${productId}/imagen`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen }),
      });

      if (response.ok) {
        await cargarCatalogoVisual();
        alert('Imagen eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const descargarCatalogoPDF = async () => {
    try {
      const response = await fetch(`${API_URL}/catalogo/descargar/catalogo-visual/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalogo-visual.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el catálogo');
    }
  };

  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || producto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo Visual</h1>
            <p className="text-gray-600 mt-1">Gestiona las imágenes y visualización del catálogo público</p>
          </div>
          <button
            onClick={descargarCatalogoPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.map((producto) => (
          <div key={producto.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Imagen principal */}
            <div className="relative h-48 bg-gray-100">
              {producto.imagen_principal ? (
                <img
                  src={producto.imagen_principal}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ display: producto.imagen_principal ? 'none' : 'flex' }}>
                <PhotoIcon className="w-16 h-16" />
              </div>
              
              {/* Indicador de producto destacado */}
              {producto.destacado && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1.5 rounded-lg shadow-sm">
                  <StarIconSolid className="w-4 h-4" />
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleDestacar(producto.id, !producto.destacado)}
                  className={`p-1.5 rounded-lg shadow-sm transition-colors ${
                    producto.destacado 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-white/90 hover:bg-white text-gray-700'
                  }`}
                  title={producto.destacado ? 'Quitar de destacados' : 'Destacar producto'}
                >
                  {producto.destacado ? (
                    <StarIconSolid className="w-4 h-4" />
                  ) : (
                    <StarIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(producto);
                    setShowImageModal(true);
                  }}
                  className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow-sm transition-colors"
                  title="Gestionar imágenes"
                >
                  <PencilIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Indicador de imágenes adicionales */}
              {producto.imagenes.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{producto.imagenes.length} fotos
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">{producto.nombre}</h3>
                {producto.destacado && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{producto.categoria}</p>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{producto.descripcion}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Stock: <span className={`font-medium ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {producto.stock}
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${producto.precio_final?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Modal de gestión de imágenes */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestionar Imágenes</h2>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-medium mb-4">{selectedProduct.nombre}</h3>

              {/* Imagen principal */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Imagen Principal</h4>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedProduct.imagen_principal ? (
                      <img
                        src={selectedProduct.imagen_principal}
                        alt="Principal"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          actualizarImagenPrincipal(selectedProduct.id, file);
                        }
                      }}
                      className="mb-2"
                      disabled={uploading}
                    />
                    <p className="text-sm text-gray-600">Selecciona una nueva imagen principal</p>
                  </div>
                </div>
              </div>

              {/* Imágenes adicionales */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Imágenes Adicionales</h4>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {selectedProduct.imagenes.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imagen}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => eliminarImagen(selectedProduct.id, imagen)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        agregarImagenes(selectedProduct.id, files);
                      }
                    }}
                    className="mb-2"
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-600">Selecciona múltiples imágenes para agregar</p>
                </div>
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Subiendo imagen...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
