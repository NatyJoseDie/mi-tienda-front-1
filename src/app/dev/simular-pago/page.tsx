'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Solo disponible en modo desarrollo
if (process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
  throw new Error('Esta página solo está disponible en modo desarrollo');
}

interface SimulacionPago {
  monto: number;
  tienda: string;
  producto: string;
  metodoPago: 'tarjeta' | 'transferencia' | 'efectivo';
  resultado: 'exitoso' | 'fallido' | 'pendiente';
  tiempoEspera: number; // segundos
}

const SimularPagoPage: React.FC = () => {
  const router = useRouter();
  const [simulacion, setSimulacion] = useState<SimulacionPago>({
    monto: 100,
    tienda: 'Mi Tienda Demo',
    producto: 'Producto de Prueba',
    metodoPago: 'tarjeta',
    resultado: 'exitoso',
    tiempoEspera: 3,
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleInputChange = (field: keyof SimulacionPago, value: any) => {
    setSimulacion(prev => ({ ...prev, [field]: value }));
  };

  const simularPago = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setLogs([]);
    
    addLog('Iniciando simulación de pago...');
    addLog(`Monto: $${simulacion.monto}`);
    addLog(`Método: ${simulacion.metodoPago}`);
    addLog(`Resultado esperado: ${simulacion.resultado}`);
    
    // Simular tiempo de procesamiento
    for (let i = 0; i < simulacion.tiempoEspera; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog(`Procesando... ${i + 1}/${simulacion.tiempoEspera}s`);
    }
    
    // Generar resultado basado en la configuración
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let result;
    switch (simulacion.resultado) {
      case 'exitoso':
        result = {
          success: true,
          transactionId,
          status: 'completed',
          amount: simulacion.monto,
          currency: 'USD',
          paymentMethod: simulacion.metodoPago,
          timestamp: new Date().toISOString(),
          receipt: {
            store: simulacion.tienda,
            product: simulacion.producto,
            subtotal: simulacion.monto * 0.85,
            tax: simulacion.monto * 0.15,
            total: simulacion.monto,
          },
        };
        addLog('✅ Pago procesado exitosamente');
        break;
        
      case 'fallido':
        result = {
          success: false,
          transactionId,
          status: 'failed',
          error: 'INSUFFICIENT_FUNDS',
          errorMessage: 'Fondos insuficientes en la cuenta',
          timestamp: new Date().toISOString(),
        };
        addLog('❌ Pago fallido: Fondos insuficientes');
        break;
        
      case 'pendiente':
        result = {
          success: true,
          transactionId,
          status: 'pending',
          amount: simulacion.monto,
          currency: 'USD',
          paymentMethod: simulacion.metodoPago,
          timestamp: new Date().toISOString(),
          estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        addLog('⏳ Pago en proceso de verificación');
        break;
    }
    
    setSimulationResult(result);
    addLog('Simulación completada');
    setIsSimulating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog('Copiado al portapapeles');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Pagos</h1>
              <p className="text-gray-600 mt-2">Herramienta de desarrollo para testing de pagos</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              🚧 Modo Desarrollo
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Configuración */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCardIcon className="w-6 h-6 mr-2" />
                Configuración de Simulación
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    value={simulacion.monto}
                    onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Espera (s)
                  </label>
                  <input
                    type="number"
                    value={simulacion.tiempoEspera}
                    onChange={(e) => handleInputChange('tiempoEspera', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tienda
                </label>
                <input
                  type="text"
                  value={simulacion.tienda}
                  onChange={(e) => handleInputChange('tienda', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <input
                  type="text"
                  value={simulacion.producto}
                  onChange={(e) => handleInputChange('producto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={simulacion.metodoPago}
                  onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tarjeta">Tarjeta de Crédito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>
              
              {/* Resultado esperado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado Esperado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['exitoso', 'fallido', 'pendiente'] as const).map((resultado) => (
                    <button
                      key={resultado}
                      onClick={() => handleInputChange('resultado', resultado)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${
                          simulacion.resultado === resultado
                            ? resultado === 'exitoso'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : resultado === 'fallido'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }
                        border
                      `}
                    >
                      {resultado === 'exitoso' && '✅'} 
                      {resultado === 'fallido' && '❌'} 
                      {resultado === 'pendiente' && '⏳'} 
                      {resultado.charAt(0).toUpperCase() + resultado.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Botón de simulación */}
              <button
                onClick={simularPago}
                disabled={isSimulating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSimulating ? 'Simulando...' : 'Simular Pago'}
              </button>
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="space-y-6">
            {/* Logs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Logs de Simulación</h3>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </button>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">No hay logs disponibles...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Resultado */}
            {simulationResult && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {simulationResult.success ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500 mr-2" />
                    )}
                    Resultado de la Simulación
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(simulationResult, null, 2))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Copiar JSON
                  </button>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(simulationResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimularPagoPage;