'use client';

import { useState } from 'react';
import { login } from '@/lib/auth';
import SecurityHandler, { useSecurityHandler } from '../../components/SecurityHandler';

export default function TestLoginPage() {
  const { securityError, handleSecurityError, clearSecurityError, parseApiError } = useSecurityHandler();
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test123');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    clearSecurityError();

    try {
      const loginResult = await login(email, password);
      setResult(loginResult);
    } catch (err: any) {
      console.log('Error completo:', err);
      
      // Verificar si es un error de seguridad
      const secError = parseApiError(err);
      if (secError) {
        handleSecurityError(secError);
      } else {
        setError(err.message || 'Error desconocido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Test de Login</h1>
        
        {/* Error de seguridad */}
        {securityError && (
          <div className="mb-4">
            <SecurityHandler 
              error={securityError} 
              onDismiss={clearSecurityError}
            />
          </div>
        )}
        
        {/* Error normal */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Resultado exitoso */}
        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">Login exitoso!</p>
            <pre className="text-sm mt-2 text-green-600">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Probando...' : 'Probar Login'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:text-blue-700">
            ← Volver al login normal
          </a>
        </div>
      </div>
    </div>
  );
}