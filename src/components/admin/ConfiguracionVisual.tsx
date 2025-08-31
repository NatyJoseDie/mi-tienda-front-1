import { useState, useEffect } from 'react';
import { useConfiguracion } from '@/hooks/useConfiguracion';

export default function ConfiguracionVisual() {
  const { config, loading, actualizarConfig } = useConfiguracion();
  const [colores, setColores] = useState({
    primario: '',
    secundario: '',
    acento: ''
  });

  useEffect(() => {
    if (config?.visual) {
      setColores({
        primario: config.visual.color_primario || '',
        secundario: config.visual.color_secundario || '',
        acento: config.visual.color_acento || ''
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    try {
      await actualizarConfig({
        visual: {
          ...config.visual,
          color_primario: colores.primario,
          color_secundario: colores.secundario,
          color_acento: colores.acento
        },
        negocio: config.negocio
      });
      alert('Configuración actualizada');
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configuración Visual</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Primario
            </label>
            <input
              type="color"
              value={colores.primario}
              onChange={(e) => setColores({...colores, primario: e.target.value})}
              className="w-full h-12 rounded-md border border-gray-300 cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
            <input
              type="color"
              value={colores.secundario}
              onChange={(e) => setColores({...colores, secundario: e.target.value})}
              className="w-full h-12 rounded-md border border-gray-300 cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Acento
            </label>
            <input
              type="color"
              value={colores.acento}
              onChange={(e) => setColores({...colores, acento: e.target.value})}
              className="w-full h-12 rounded-md border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}