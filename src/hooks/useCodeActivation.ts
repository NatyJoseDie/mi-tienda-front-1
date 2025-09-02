'use client';

import { useState, useCallback } from 'react';

interface SolicitarCodigoDto {
  email: string;
  nombreTienda: string;
  tipoNegocio: string;
  descripcion: string;
}

interface RegistroConCodigoDto {
  codigo: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion?: string;
  password: string;
}

interface CodigoValidationResponse {
  valid: boolean;
  email?: string;
  nombreTienda?: string;
  message?: string;
}

interface UseCodeActivationReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  isValidating: boolean;
  isRequesting: boolean;
  isRegistering: boolean;
  
  // Datos
  validationResult: CodigoValidationResponse | null;
  requestResult: { email: string; nombreTienda: string; codigo?: string } | null;
  
  // Funciones
  solicitarCodigo: (data: SolicitarCodigoDto) => Promise<boolean>;
  validarCodigo: (codigo: string) => Promise<boolean>;
  registrarConCodigo: (data: RegistroConCodigoDto) => Promise<boolean>;
  clearError: () => void;
  clearResults: () => void;
}

export const useCodeActivation = (): UseCodeActivationReturn => {
  // Estados de carga
  const [isValidating, setIsValidating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Estados de datos
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<CodigoValidationResponse | null>(null);
  const [requestResult, setRequestResult] = useState<{ email: string; nombreTienda: string; codigo?: string } | null>(null);
  
  // Estado de carga general
  const isLoading = isValidating || isRequesting || isRegistering;

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar resultados
  const clearResults = useCallback(() => {
    setValidationResult(null);
    setRequestResult(null);
    setError(null);
  }, []);

  // Solicitar código de activación
  const solicitarCodigo = useCallback(async (data: SolicitarCodigoDto): Promise<boolean> => {
    try {
      setIsRequesting(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/solicitar-codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al solicitar código');
      }

      const responseData = await response.json();
      
      // Preparar resultado
      const result = {
        email: data.email,
        nombreTienda: data.nombreTienda,
        ...(process.env.NEXT_PUBLIC_DEV_MODE === 'true' && responseData.codigo ? { codigo: responseData.codigo } : {}),
      };
      
      setRequestResult(result);
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al solicitar código de activación';
      setError(errorMessage);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Validar código de activación
  const validarCodigo = useCallback(async (codigo: string): Promise<boolean> => {
    try {
      setIsValidating(true);
      setError(null);
      
      if (!codigo || codigo.length !== 8) {
        setError('El código debe tener 8 caracteres');
        return false;
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/validar-codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al validar código');
      }

      const responseData = await response.json();
      
      if (responseData.valido) {
        setValidationResult(responseData);
        return true;
      } else {
        setError('Código de activación inválido');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Error al validar código de activación';
      setError(errorMessage);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Registrar con código de activación
  const registrarConCodigo = useCallback(async (data: RegistroConCodigoDto): Promise<boolean> => {
    try {
      setIsRegistering(true);
      setError(null);
      
      // Validaciones básicas
      if (!data.codigo || data.codigo.length !== 8) {
        setError('El código debe tener 8 caracteres');
        return false;
      }
      
      if (!data.email || !data.nombre || !data.password) {
        setError('Todos los campos obligatorios deben estar completos');
        return false;
      }
      
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        setError('Formato de email inválido');
        return false;
      }
      
      // Validar contraseña
      if (data.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return false;
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/register-with-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }
      
      // El registro fue exitoso
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Error al registrar administrador';
      
      const httpError = err as { response?: { data?: { message?: string }; status?: number } };
       
       if (httpError?.response?.data?.message) {
         errorMessage = httpError.response.data.message;
       } else if (httpError?.response?.status === 400) {
         errorMessage = 'Datos de registro inválidos';
       } else if (httpError?.response?.status === 409) {
         errorMessage = 'El email ya está registrado';
       } else if (httpError?.response?.status === 422) {
         errorMessage = 'Código de activación inválido o expirado';
       } else if ((err as Error)?.message) {
         errorMessage = (err as Error).message;
       }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    // Estados
    isLoading,
    error,
    isValidating,
    isRequesting,
    isRegistering,
    
    // Datos
    validationResult,
    requestResult,
    
    // Funciones
    solicitarCodigo,
    validarCodigo,
    registrarConCodigo,
    clearError,
    clearResults,
  };
};

export default useCodeActivation;