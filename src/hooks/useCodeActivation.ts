'use client';

import { useState, useCallback } from 'react';
import { authService, SolicitarCodigoDto, RegistroConCodigoDto, CodigoValidationResponse } from '../services/auth';

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
      
      const response = await authService.solicitarCodigo(data);
      
      // Preparar resultado
      const result = {
        email: data.email,
        nombreTienda: data.nombreTienda,
        ...(process.env.NEXT_PUBLIC_DEV_MODE === 'true' && response.codigo ? { codigo: response.codigo } : {}),
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
      
      const response = await authService.validarCodigo(codigo);
      
      if (response.valido) {
        setValidationResult(response);
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
      
      await authService.registrarConCodigo(data);
      
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