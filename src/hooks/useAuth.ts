// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { authService, AuthResponse, UserProfile, LoginDto, RevendedorRegisterDto } from '../services/auth';

export interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<void>;
  registerRevendedor: (data: RevendedorRegisterDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Verificar si hay datos guardados
        const savedProfile = authService.getSavedUserProfile();
        if (savedProfile && authService.isAuthenticated()) {
          // Validar token con el servidor
          const isValid = await authService.validateToken();
          if (isValid) {
            setUser(savedProfile);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpiar datos
            authService.logout();
          }
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función para manejar respuesta de autenticación
  const handleAuthSuccess = useCallback((authResponse: AuthResponse) => {
    authService.saveAuthData(authResponse);
    setUser(authResponse.user);
    setIsAuthenticated(true);
    setError(null);
  }, []);

  // Login
  const login = useCallback(async (data: LoginDto) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authResponse = await authService.login(data.email, data.password);
      handleAuthSuccess(authResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Registro de revendedor
  const registerRevendedor = useCallback(async (data: RevendedorRegisterDto) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authResponse = await authService.registerRevendedor(data);
      handleAuthSuccess(authResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar revendedor';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar perfil
  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
      // Actualizar datos guardados
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (err) {
      console.error('Error al refrescar perfil:', err);
      // Si falla, probablemente el token expiró
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    registerRevendedor,
    logout,
    clearError,
    refreshProfile,
  };
};