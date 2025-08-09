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
        // Recargar la lista completa
        await cargarCatalogoVisual();
        
        // Buscar y actualizar el producto seleccionado desde la lista ya cargada
        setProductos(prevProductos => {
          const updatedProduct = prevProductos.find(p => p.id === productId);
          if (updatedProduct && selectedProduct) {
            setSelectedProduct(updatedProduct);
          }
          return prevProductos;
        });
        
        alert('✅ Imagen principal actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      alert('❌ Error al actualizar la imagen');
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
        // Recargar la lista completa
        await cargarCatalogoVisual();
        
        // Buscar y actualizar el producto seleccionado desde la lista ya cargada
        setProductos(prevProductos => {
          const updatedProduct = prevProductos.find(p => p.id === productId);
          if (updatedProduct && selectedProduct) {
            setSelectedProduct(updatedProduct);
          }
          return prevProductos;
        });
        
        alert('✅ Imágenes agregadas correctamente');
      }
    } catch (error) {
      console.error('Error al agregar imágenes:', error);
      alert('❌ Error al agregar las imágenes');
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
        // Recargar la lista completa
        await cargarCatalogoVisual();
        
        // Buscar y actualizar el producto seleccionado desde la lista ya cargada
        setProductos(prevProductos => {
          const updatedProduct = prevProductos.find(p => p.id === productId);
          if (updatedProduct && selectedProduct) {
            setSelectedProduct(updatedProduct);
          }
          return prevProductos;
        });
        
        alert('✅ Imagen eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('❌ Error al eliminar la imagen');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {productosFiltrados.map((producto) => (
          <div key={producto.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Imagen principal */}
            <div className="relative h-64 bg-gray-100">
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
                <PhotoIcon className="w-20 h-20" />
              </div>
              
              {/* Indicador de producto destacado */}
              {producto.destacado && (
                <div className="absolute top-3 left-3 bg-yellow-500 text-white p-2 rounded-xl shadow-lg">
                  <StarIconSolid className="w-5 h-5" />
                </div>
              )}
              
              {/* Contador de imágenes */}
              {producto.imagenes && producto.imagenes.length > 0 && (
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  +{producto.imagenes.length} fotos
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggleDestacar(producto.id, !producto.destacado)}
                  className={`p-2 rounded-xl shadow-lg transition-all duration-200 ${
                    producto.destacado 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-white/90 hover:bg-white text-gray-700'
                  }`}
                  title={producto.destacado ? 'Quitar de destacados' : 'Destacar producto'}
                >
                  {producto.destacado ? (
                    <StarIconSolid className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(producto);
                    setShowImageModal(true);
                  }}
                  className="bg-white/90 hover:bg-white p-2 rounded-xl shadow-lg transition-all duration-200"
                  title="Gestionar imágenes"
                >
                  <PencilIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Información del producto */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {producto.categoria}
                  </span>
                </div>
              </div>
              
              {producto.descripcion && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {producto.descripcion}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {producto.stock || 0}
                  </p>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🖼️ Gestionar Producto</h2>
                  <p className="text-indigo-100 text-sm mt-1">Edita imágenes, título y descripción</p>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Sección de información básica */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✏️ Información del Producto
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Nombre del producto
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.nombre}
                      onChange={(e) => {
                        setSelectedProduct(prev => prev ? {...prev, nombre: e.target.value} : null);
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="Ingresa el nombre del producto"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📄 Descripción
                    </label>
                    <textarea
                      value={selectedProduct.descripcion || ''}
                      onChange={(e) => {
                        setSelectedProduct(prev => prev ? {...prev, descripcion: e.target.value} : null);
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                      placeholder="Describe el producto (opcional)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_URL}/catalogo/producto/${selectedProduct.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            nombre: selectedProduct.nombre,
                            descripcion: selectedProduct.descripcion
                          })
                        });
                        
                        if (response.ok) {
                          // Actualizar la lista local
                          setProductos(prev => 
                            prev.map(p => p.id === selectedProduct.id ? {...p, ...selectedProduct} : p)
                          );
                          alert('✅ Información actualizada correctamente');
                        } else {
                          const errorText = await response.text();
                          console.error('Error del backend:', errorText);
                          alert('❌ Error al actualizar la información');
                        }
                      } catch (error) {
                        console.error('Error de conexión:', error);
                        alert('❌ Error de conexión');
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    💾 Guardar Información
                  </button>
                </div>
              </div>

              {/* Imagen principal */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🖼️ Imagen Principal
                </h4>
                <div className="flex items-start gap-6">
                  <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-gray-200">
                    {selectedProduct.imagen_principal ? (
                      <img
                        src={selectedProduct.imagen_principal}
                        alt="Principal"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error cargando imagen principal:', selectedProduct.imagen_principal);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen principal cargada correctamente');
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 ${selectedProduct.imagen_principal ? 'hidden' : 'flex'}`}
                    >
                      <PhotoIcon className="w-12 h-12 mb-2" />
                      <span className="text-xs text-center px-2">Sin imagen principal</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('📤 Subiendo imagen principal:', file.name);
                            actualizarImagenPrincipal(selectedProduct.id, file);
                          }
                        }}
                        className="w-full"
                        disabled={uploading}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        📤 Selecciona una nueva imagen principal
                      </p>
                      {selectedProduct.imagen_principal && (
                        <p className="text-xs text-gray-500 mt-1">
                          📎 Actual: {selectedProduct.imagen_principal.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Imágenes adicionales */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🖼️ Galería de Imágenes ({selectedProduct.imagenes?.length || 0})
                </h4>
                
                {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    {selectedProduct.imagenes.map((imagen, index) => (
                      <div key={`${selectedProduct.id}-${index}`} className="relative group">
                        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                          <img
                            src={imagen}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              console.error(`Error cargando imagen ${index + 1}:`, imagen);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                            onLoad={() => {
                              console.log(`✅ Imagen ${index + 1} cargada correctamente`);
                            }}
                          />
                          <div className="hidden w-full h-full flex-col items-center justify-center text-gray-400 bg-gray-200">
                            <PhotoIcon className="w-6 h-6 mb-1" />
                            <span className="text-xs">Error</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            console.log(`🗑️ Eliminando imagen ${index + 1}:`, imagen);
                            eliminarImagen(selectedProduct.id, imagen);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          title="Eliminar imagen"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <PhotoIcon className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No hay imágenes adicionales</p>
                    <p className="text-sm">Sube algunas imágenes para crear una galería</p>
                  </div>
                )}

                <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 hover:border-yellow-400 transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        console.log(`📤 Subiendo ${files.length} imágenes adicionales`);
                        agregarImagenes(selectedProduct.id, files);
                      }
                    }}
                    className="w-full"
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    📤 Selecciona múltiples imágenes para agregar a la galería
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Formatos soportados: JPG, PNG, GIF • Máximo 5MB por imagen
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="text-center py-6 bg-blue-50 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-lg font-medium text-blue-700 mt-3">Subiendo imagen...</p>
                  <p className="text-sm text-blue-600">Por favor espera un momento</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
