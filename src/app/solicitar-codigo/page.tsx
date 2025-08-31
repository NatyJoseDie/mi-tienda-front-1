'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SolicitarCodigo from '../../components/SolicitarCodigo';
import SecurityHandler from '@/components/SecurityHandler';
import type { SecurityError } from '@/components/SecurityHandler';

export default function SolicitarCodigoPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; nombreTienda: string; codigo?: string }>({} as any);
  const [securityError, setSecurityError] = useState<SecurityError | null>(null);

  const handleSuccess = (data: { email: string; nombreTienda: string; codigo?: string }) => {
    setSuccessData(data);
    setShowSuccess(true);
    setSecurityError(null);
  };

  const handleError = (error: any) => {
    // Verificar si el error tiene la estructura de SecurityError
    if (error && typeof error === 'object' && error.type && error.message) {
      setSecurityError(error as SecurityError);
    } else {
      console.error('Error al solicitar código:', error);
      // Aquí podrías manejar otros tipos de errores, por ejemplo, mostrando un toast
    }
  };

  const handleRetry = () => {
    setSecurityError(null);
  };

  const handleContinueToRegister = () => {
    // Si tenemos código (modo desarrollo), redirigir con el código
    if (successData.codigo) {
      router.push(`/registro-admin?codigo=${successData.codigo}`);
    } else {
      // En producción, solo redirigir a la página de registro
      router.push('/registro-admin');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Código Enviado!
            </h1>
            
            <p className="text-gray-600 mb-4">
              Hemos enviado un código de activación a:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-900">{successData.email}</p>
              <p className="text-sm text-blue-700">Para: {successData.nombreTienda}</p>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>Importante:</strong> Revisa tu bandeja de entrada y carpeta de spam.
              </p>
              <p>
                El código expira en <strong>24 horas</strong>.
              </p>
            </div>
            
            {/* Mostrar código en modo desarrollo */}
            {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && successData.codigo && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Modo Desarrollo:</strong>
                </p>
                <p className="text-lg font-mono font-bold text-yellow-900">
                  {successData.codigo}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Este código es visible solo en desarrollo
                </p>
              </div>
            )}
            
            <div className="mt-8 space-y-3">
              <button
                onClick={handleContinueToRegister}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {successData.codigo ? 'Continuar con Registro' : 'Ir a Registro'}
              </button>
              
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
              >
                Solicitar otro código
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {securityError ? (
          <SecurityHandler
            error={securityError}
            onRetry={handleRetry}
            onDismiss={() => setSecurityError(null)}
          />
        ) : (
          <SolicitarCodigo
            onSuccess={handleSuccess}
            onError={handleError}
            className="w-full"
          />
        )}
        
        {/* Enlaces adicionales */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿Ya tienes un código?{' '}
            <button
              onClick={() => router.push('/registro-admin')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Registrarse aquí
            </button>
          </p>
          
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar Sesión
            </button>
          </p>
          
          <p className="text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Volver al inicio
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}