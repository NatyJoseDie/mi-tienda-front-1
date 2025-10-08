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
import api from '@/lib/api';
import { resolveImageUrl } from '@/utils/imageUtils';

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

export default function AdminCatalogoVisual() {
  // Helper para resolver URLs de imágenes
  const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Estados para productos y UI
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductoCatalogo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  
  // Estados para vista previa de imágenes
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Cargar productos del catálogo
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catalogo/productos');
      const raw = response.data;
      const mapped: ProductoCatalogo[] = (Array.isArray(raw) ? raw : []).map((p: any) => {
        const categoria = typeof p.categoria === 'string' ? p.categoria : (p?.categoria?.nombre || '');
        return {
          id: p.id,
          nombre: p.nombre || p.titulo || '',
          descripcion: p.descripcion || p.descripcion_corta || '',
          categoria,
          imagen_principal: p.imagen_principal ?? p.imagen ?? null,
          imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
          stock: typeof p.stock === 'number' ? p.stock : (p.stock_total ?? 0),
          precio_final: p.precio_final ?? p.precio ?? null,
          destacado: Boolean(p.destacado ?? p.is_featured ?? false),
        } as ProductoCatalogo;
      });
      setProductos(mapped);
      setError(null);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos del catálogo');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Actualizar imagen principal
  const actualizarImagenPrincipal = async (productoId: string, file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('imagen', file);

      // Asegurar envío del token en esta llamada multipart/form-data
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const response = await api.patch(`/catalogo/producto/${productoId}/imagen-principal`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200 || response.status === 201) {
        // Actualizar la imagen en el estado local
        const nuevaImagenUrl = response.data.imagen_principal;
        setProductos(prev => 
          prev.map(p => p.id === productoId ? { ...p, imagen_principal: nuevaImagenUrl } : p)
        );
        if (selectedProduct?.id === productoId) {
          setSelectedProduct(prev => (prev ? { ...prev, imagen_principal: nuevaImagenUrl } : null));
        }
        console.log('✅ Imagen principal actualizada');
      }
    } catch (error: any) {
      console.error('Error al actualizar imagen principal:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert('❌ Error al actualizar la imagen principal: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  // Agregar imágenes a la galería
  const agregarImagenes = async (productoId: string, files: FileList) => {
    try {
      setUploading(true);
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('imagenes', file);
      });

      // Asegurar envío del token en esta llamada multipart/form-data
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const response = await api.post(`/catalogo/producto/${productoId}/imagenes`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200 || response.status === 201) {
        // Actualizar las imágenes en el estado local
        const nuevasImagenes = response.data.imagenes;
        setProductos(prev => 
          prev.map(p => p.id === productoId ? { ...p, imagenes: nuevasImagenes } : p)
        );
        if (selectedProduct?.id === productoId) {
          setSelectedProduct(prev => (prev ? { ...prev, imagenes: nuevasImagenes } : null));
        }
        console.log('✅ Imágenes agregadas a la galería');
      }
    } catch (error: any) {
      console.error('Error al agregar imágenes:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert('❌ Error al agregar las imágenes: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar imagen principal
  const eliminarImagenPrincipal = async (productoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar la imagen principal?')) return;

    try {
      setUploading(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const response = await api.delete(`/catalogo/producto/${productoId}/imagen-principal`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200 || response.status === 204) {
        // Actualizar el estado local
        setProductos(prev => 
          prev.map(p => p.id === productoId ? { ...p, imagen_principal: null } : p)
        );
        if (selectedProduct?.id === productoId) {
          setSelectedProduct(prev => (prev ? { ...prev, imagen_principal: null } : null));
        }
        console.log('✅ Imagen principal eliminada');
      }
    } catch (error: any) {
      console.error('Error al eliminar imagen principal:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert('❌ Error al eliminar la imagen principal: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar imagen de la galería
  const eliminarImagen = async (productoId: string, imagenUrl: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    try {
      setUploading(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const response = await api.delete(`/catalogo/producto/${productoId}/imagen`, {
        data: { imagen_url: imagenUrl },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200 || response.status === 204) {
        // Actualizar el estado local
        const nuevasImagenes = response.data?.imagenes ?? [];
        setProductos(prev => 
          prev.map(p => p.id === productoId ? { ...p, imagenes: nuevasImagenes } : p)
        );
        if (selectedProduct?.id === productoId) {
          setSelectedProduct(prev => (prev ? { ...prev, imagenes: nuevasImagenes } : null));
        }
        console.log('✅ Imagen eliminada de la galería');
      }
    } catch (error: any) {
      console.error('Error al eliminar imagen:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert('❌ Error al eliminar la imagen: ' + msg);
    } finally {
      setUploading(false);
    }
  };

  // Alternar destacado
  const toggleDestacado = async (productoId: string, destacado: boolean) => {
    try {
      const formData = new FormData();
      formData.append('destacado', String(!destacado));
      const response = await api.put(`/productos/${productoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.status === 200) {
        // Actualizar el estado local
        setProductos(prev => 
          prev.map(p => p.id === productoId ? { ...p, destacado: !destacado } : p)
        );
        console.log(`✅ Producto ${!destacado ? 'destacado' : 'no destacado'}`);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message || 'Error desconocido';
      console.error('Error al cambiar destacado:', error);
      alert(`❌ Error al cambiar el estado destacado (${status || 'sin código'}): ${msg}`);
    }
  };

  // Descargar catálogo PDF
  const descargarCatalogoPDF = async () => {
    try {
      const response = await api.get('/catalogo/descargar-pdf', {
        responseType: 'blob'
      });
      
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'catalogo-productos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Catálogo PDF descargado');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('❌ Error al descargar el catálogo PDF');
    }
  };

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];













  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, productId: string, isGallery: boolean = false) => {
    e.preventDefault();
    setDragOver(false);
    setDragOverGallery(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (isGallery) {
        agregarImagenes(productId, files);
      } else {
        actualizarImagenPrincipal(productId, files[0]);
      }
    }
  };

  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGallery(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGallery(false);
  };

  const openImagePreview = (images: string[], startIndex: number = 0) => {
    setPreviewImages(images);
    setCurrentImageIndex(startIndex);
    setZoomLevel(1);
    setImagePreviewModal(true);
  };

  const closeImagePreview = () => {
    setImagePreviewModal(false);
    setPreviewImages([]);
    setCurrentImageIndex(0);
    setZoomLevel(1);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };



  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'todas' || producto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-20 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">Cargando Catálogo Visual</h3>
          <p className="text-slate-600">Obteniendo productos y sus imágenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-slate-500/25"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                  </svg>
                  Volver al Panel
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Catálogo Visual</h1>
                  <p className="text-slate-600 mt-1 font-medium">Gestiona las imágenes y visualización del catálogo público</p>
                </div>
              </div>
              <button
                onClick={descargarCatalogoPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-slate-400"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-slate-700 font-medium min-w-[200px]"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border border-white/50">
            {/* Imagen principal */}
            <div className="relative h-64 bg-gray-100 cursor-pointer"
                 onClick={() => {
                   const allImages = [producto.imagen_principal, ...(producto.imagenes || [])]
                     .filter((img): img is string => Boolean(img))
                     .map((u) => resolveImageUrl(u));
                   if (allImages.length > 0) {
                     openImagePreview(allImages, 0);
                   }
                 }}>
              {producto.imagen_principal ? (
                <img
                  src={resolveImageUrl(producto.imagen_principal)}
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
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => toggleDestacado(producto.id, producto.destacado || false)}
                  className={`p-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    producto.destacado 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-yellow-500/25' 
                      : 'bg-white/90 hover:bg-white text-slate-700 shadow-slate-500/25'
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
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110 shadow-indigo-500/25"
                  title="Gestionar imágenes"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Información del producto */}
            <div className="p-6 bg-gradient-to-br from-white/50 to-slate-50/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-300">
                    {producto.nombre}
                  </h3>
                  <span className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full border border-indigo-200">
                    {producto.categoria}
                  </span>
                </div>
              </div>
              
              {producto.descripcion && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ${producto.precio_final?.toLocaleString('es-AR') || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    Stock: <span className={`${producto.stock > 10 ? 'text-emerald-600' : producto.stock > 0 ? 'text-amber-600' : 'text-red-500'} font-semibold`}>{producto.stock || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        {productosFiltrados.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 text-center py-16">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <PhotoIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron productos</h3>
              <p className="text-slate-600 max-w-md mx-auto">Intenta ajustar los filtros de búsqueda o verifica que existan productos en el catálogo</p>
            </div>
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
                        const formData = new FormData();
                        if (selectedProduct.nombre != null) formData.append('nombre', selectedProduct.nombre);
                        if (selectedProduct.descripcion != null) formData.append('descripcion', selectedProduct.descripcion);

                        const response = await api.put(`/productos/${selectedProduct.id}`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        
                        if (response.status === 200) {
                          // Actualizar la lista local
                          setProductos(prev => 
                            prev.map(p => p.id === selectedProduct.id ? { ...p, ...selectedProduct } : p)
                          );
                          alert('✅ Información actualizada correctamente');
                        }
                      } catch (error) {
                        console.error('Error al actualizar información:', error);
                        alert('❌ Error al actualizar la información');
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
                  <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-gray-200 cursor-pointer"
                       onClick={() => {
                         if (selectedProduct.imagen_principal) {
                           const allImages = [selectedProduct.imagen_principal, ...(selectedProduct.imagenes || [])].filter(Boolean);
                           openImagePreview(allImages, 0);
                         }
                       }}>
                    {selectedProduct.imagen_principal ? (
                      <img
                        src={resolveImageUrl(selectedProduct.imagen_principal)}
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
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
                        dragOver 
                          ? 'border-purple-500 bg-purple-50 scale-105' 
                          : 'border-purple-300 hover:border-purple-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, selectedProduct.id, false)}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('📤 Subiendo imagen principal');
                            actualizarImagenPrincipal(selectedProduct.id, file);
                          }
                        }}
                        className="w-full"
                        disabled={uploading}
                      />
                      <div className="text-center mt-2">
                        <p className="text-sm text-gray-600">
                          📤 Selecciona o arrastra una imagen principal
                        </p>
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          🖱️ Arrastra y suelta aquí tu imagen
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Formatos soportados: JPG, PNG, GIF • Máximo 5MB
                        </p>
                      </div>
                    </div>
                    {selectedProduct.imagen_principal && (
                      <button
                        onClick={() => {
                          console.log('🗑️ Eliminando imagen principal');
                          eliminarImagenPrincipal(selectedProduct.id);
                        }}
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                        disabled={uploading}
                      >
                        <TrashIcon className="w-4 h-4" />
                        Eliminar Imagen Principal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Imágenes adicionales */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🖼️ Galería de Imágenes ({selectedProduct?.imagenes?.length || 0})
                </h4>
                
                {selectedProduct?.imagenes && selectedProduct.imagenes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    {selectedProduct.imagenes.map((imagen, index) => (
                      <div key={`${selectedProduct?.id}-${index}`} className="relative group">
                        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md cursor-pointer"
                             onClick={() => openImagePreview(selectedProduct?.imagenes || [], index)}>
                          <img
                            src={resolveImageUrl(imagen)}
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
                            if (selectedProduct?.id) eliminarImagen(selectedProduct.id, imagen);
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

                <div 
                  className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 bg-white ${
                    dragOverGallery 
                      ? 'border-yellow-500 bg-yellow-50 scale-105' 
                      : 'border-yellow-300 hover:border-yellow-400'
                  }`}
                  onDragOver={handleGalleryDragOver}
                  onDragLeave={handleGalleryDragLeave}
                  onDrop={(e) => selectedProduct?.id && handleDrop(e, selectedProduct.id, true)}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        console.log(`📤 Subiendo ${files.length} imagen(es) a la galería`);
                        if (selectedProduct?.id) agregarImagenes(selectedProduct.id, files);
                      }
                    }}
                    className="w-full"
                    disabled={uploading}
                  />
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-600">
                      📤 Selecciona o arrastra imágenes para la galería
                    </p>
                    <p className="text-xs text-yellow-600 font-medium mt-1">
                      🖱️ Arrastra y suelta aquí tus imágenes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, WebP (máx. 5MB c/u)
                    </p>
                  </div>
                  {uploading && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center gap-2 text-yellow-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span className="text-sm font-medium">Subiendo imágenes...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa expandida */}
        {imagePreviewModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-7xl max-h-full">
              {/* Botón cerrar */}
              <button
                onClick={closeImagePreview}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Navegación anterior */}
              {previewImages.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Navegación siguiente */}
              {previewImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Controles de zoom */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <button
                  onClick={zoomOut}
                  className="text-white hover:text-gray-300 p-1 transition-colors"
                  disabled={zoomLevel <= 0.5}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="text-white hover:text-gray-300 p-1 transition-colors"
                  disabled={zoomLevel >= 3}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={resetZoom}
                  className="text-white hover:text-gray-300 text-xs px-2 py-1 rounded transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Imagen */}
              <div className="flex items-center justify-center max-h-[90vh] overflow-hidden">
                <img
                  src={resolveImageUrl(previewImages[currentImageIndex])}
                  alt={`Vista previa ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>

              {/* Indicador de imagen actual */}
              {previewImages.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {currentImageIndex + 1} / {previewImages.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}