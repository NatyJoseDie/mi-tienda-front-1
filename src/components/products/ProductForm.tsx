'use client';
import { useState, useEffect } from 'react';
import { Producto } from '@/types/producto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ProductFormProps {
  initialData?: Partial<Producto>;
  onSubmitAction: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export default function ProductForm({ initialData = {}, onSubmitAction, onCancel, loading = false }: ProductFormProps) {
  const [nombre, setNombre] = useState(initialData.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData.descripcion || '');
  // Asegurar que siempre sea un número, no null
  const [precioCosto, setPrecioCosto] = useState(initialData.precio_costo || 0);
  const [stock, setStock] = useState(initialData.stock || 0);
  const [categoria, setCategoria] = useState(initialData.categoria || '');
  const [categoriaId, setCategoriaId] = useState(initialData.categoria_id || '');
  // SKU será de solo lectura - se genera automáticamente en el backend
  const [sku, setSku] = useState(initialData.sku || '');
  // Validación más estricta para unidad_id
  const [unidadId, setUnidadId] = useState<number | undefined>(
    initialData.unidad_id && initialData.unidad_id > 0 ? initialData.unidad_id : undefined
  );
  
  // Estados para categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      console.log('Intentando cargar categorías desde:', `${API_URL}/categorias`);
      
      const response = await fetch(`${API_URL}/categorias`);
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error al cargar categorías: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Categorías recibidas:', data);
      console.log('Número de categorías:', data.length);
      
      setCategorias(data);
      
      // Si no hay categoría seleccionada y hay categorías disponibles, seleccionar la primera
      if (!categoria && data.length > 0) {
        setCategoria(data[0].nombre);
        setCategoriaId(data[0].id);
        console.log('Categoría seleccionada automáticamente:', data[0]);
      }
    } catch (err) {
      console.error('Error completo al cargar categorías:', err);
      console.error('Tipo de error:', typeof err);
      console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack available');
      setError(`Error al cargar las categorías: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      setCreatingCategory(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: newCategoryName.trim(),
          descripcion: newCategoryDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la categoría');
      }

      const newCategory = await response.json();
      
      // Actualizar la lista de categorías
      setCategorias(prev => [...prev, newCategory]);
      
      // Seleccionar la nueva categoría
      setCategoria(newCategory.nombre);
      
      // Limpiar el formulario de nueva categoría
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowNewCategoryForm(false);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + imagenes.length > 5) {
      setError('Solo puedes subir hasta 5 imágenes.');
      return;
    }
    setImagenes(prev => [...prev, ...files].slice(0, 5));
    setError(null);
  };

  const handleRemoveImage = (idx: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Remover validación de SKU ya que se genera automáticamente
    if (!nombre || !descripcion || !precioCosto || !stock || !categoria) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      // Validación antes de toString()
      formData.append('precio_costo', (precioCosto || 0).toString());
      formData.append('stock', (stock || 0).toString());
      // En el handleSubmit, enviar categoria_id:
      formData.append('categoria', categoria);
      formData.append('categoria_id', categoriaId);
      
      // Solo enviar SKU si estamos editando un producto existente
      if (initialData.id && initialData.sku) {
        formData.append('sku', initialData.sku);
      }
      
      if (unidadId !== undefined && unidadId !== null) {
        formData.append('unidad_id', unidadId.toString());
      }

      // Log de las imágenes que se van a enviar
      console.log('Enviando imágenes:', imagenes.length);
      imagenes.forEach((img, index) => {
        console.log(`Imagen ${index}:`, {
          name: img.name,
          size: img.size,
          type: img.type
        });
        formData.append('imagenes', img);
      });
      
      // Log de todos los campos
      console.log('FormData completo:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, value);
        }
      }
      
      await onSubmitAction(formData);
    } catch (err) {
      console.error('Error completo:', err);
      setError(`Error al guardar el producto: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {initialData.id ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            SKU {initialData.id ? '' : '(Se generará automáticamente)'}
          </label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 focus:outline-none" 
            value={initialData.id ? (initialData.sku || '') : 'Se generará automáticamente'} 
            readOnly
            disabled
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Precio de Costo <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={precioCosto} 
            onChange={(e) => setPrecioCosto(Number(e.target.value))} 
            required 
            min={0} 
            step={0.01}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Stock <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={stock} 
            onChange={(e) => setStock(Number(e.target.value))} 
            required 
            min={0}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={categoria} 
              onChange={(e) => {
                const selectedCategory = categorias.find(cat => cat.nombre === e.target.value);
                setCategoria(e.target.value);
                setCategoriaId(selectedCategory?.id || '');
              }} 
              required
              disabled={isLoading || loadingCategorias}
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
            
            <button
              type="button"
              className="w-full bg-green-100 text-green-700 border border-green-300 rounded-lg px-3 py-2 hover:bg-green-200 transition text-sm font-medium"
              onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
              disabled={isLoading}
            >
              {showNewCategoryForm ? 'Cancelar' : '+ Crear nueva categoría'}
            </button>
            
            {showNewCategoryForm && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la categoría <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ej: Electrónicos"
                    disabled={creatingCategory}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Descripción de la categoría..."
                    rows={2}
                    disabled={creatingCategory}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                  >
                    {creatingCategory ? 'Creando...' : 'Crear categoría'}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName('');
                      setNewCategoryDescription('');
                      setError(null);
                    }}
                    disabled={creatingCategory}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Unidad ID (opcional)
          </label>
          <input 
            type="number" 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={unidadId || ''} 
            onChange={(e) => setUnidadId(e.target.value ? Number(e.target.value) : undefined)} 
            min={1}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          required
          maxLength={1000}
          disabled={isLoading}
        />
        <span className="text-xs text-gray-400">Máx. 1000 caracteres</span>
      </div>
      
      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Imágenes (máx. 5)
        </label>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleFileChange} 
          className="mb-2"
          disabled={isLoading}
        />
        <div className="flex gap-2 flex-wrap mt-2">
          {imagenes.map((img, idx) => {
            const url = URL.createObjectURL(img);
            return (
              <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                <img src={url} alt={img.name} className="object-cover w-full h-full" />
                <button 
                  type="button" 
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100" 
                  onClick={() => handleRemoveImage(idx)}
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm font-semibold">{error}</div>
      )}
      
      <div className="flex gap-4 justify-end mt-6">
        <button 
          type="button" 
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50" 
          onClick={onCancel} 
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50" 
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}