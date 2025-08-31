'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Definimos las props que el componente recibirá.
// onAjusteGuardado es una función que se llamará para refrescar la lista de productos.
interface AjustePrecioCostoProps {
  onAjusteGuardado: () => void;
}

const AjustePrecioCosto: React.FC<AjustePrecioCostoProps> = ({ onAjusteGuardado }) => {
  const [valor, setValor] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar el valor inicial cuando el componente se monta
  useEffect(() => {
    const cargarValorInicial = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/productos/ajuste-precio-costo`);
        if (!res.ok) throw new Error('No se pudo cargar el ajuste.');
        const data = await res.json();
        setValor(data.valor);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarValorInicial();
  }, []);

  // 2. Manejar el guardado del nuevo valor
  const handleGuardar = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/productos/ajuste-precio-costo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor }),
      });
      if (!res.ok) throw new Error('Error al guardar el nuevo ajuste.');
      
      // Si se guarda correctamente, llamamos a la función del padre para recargar productos
      onAjusteGuardado();
      alert('Ajuste actualizado correctamente. La lista de productos se ha refrescado.');

    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando ajuste global...</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">⚙️ Ajuste Global de Precio de Costo</h3>
      <p className="text-sm text-gray-600 mb-3">
        Este valor (en %) se aplica al <strong>precio de costo</strong> de todos los productos antes de calcular su precio de venta final.
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={saving}
        />
        <span className="text-xl font-semibold text-gray-700">%</span>
        <button 
          onClick={handleGuardar} 
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:bg-purple-300"
        >
          {saving ? 'Guardando...' : 'Aplicar Ajuste'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AjustePrecioCosto;