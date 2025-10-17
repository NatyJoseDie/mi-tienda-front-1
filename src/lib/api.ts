// src/lib/api.ts
import axios from "axios";

// Obtener la URL del backend configurada o usar Render por defecto
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL 
  || process.env.NEXT_PUBLIC_BACKEND_URL 
  || process.env.BACKEND_URL 
  || "https://mi-tienda-backend-o9i7.onrender.com";
// URL de respaldo (Render) si la principal no funciona
const fallbackApiUrl = "https://mi-tienda-backend-o9i7.onrender.com";

// Verificar si estamos en desarrollo (puerto 3001)
const isDevelopment = typeof window !== 'undefined' && window.location.port === '3001';
// Variable para controlar si estamos usando el backend de respaldo
let usingFallbackApi = false;

const api = axios.create({
  // Usar rutas directas al backend, sin proxy
  baseURL: configuredApiUrl,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000,
});

// Interceptor de requests (antes de enviar)
api.interceptors.request.use(
  (config) => {
    // Ejemplo: agregar token si lo guardás en localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de responses (manejo de errores globales y cambio automático de backend)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si es un error de red (no se pudo conectar) y no estamos usando el fallback
    if (
      (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) &&
      !usingFallbackApi &&
      configuredApiUrl !== fallbackApiUrl
    ) {
      console.log('Error de conexión detectado. Cambiando a backend alternativo...');
      usingFallbackApi = true;
      api.defaults.baseURL = fallbackApiUrl;
      
      // Reintentar la solicitud con el nuevo backend
      const config = error.config;
      // Evitar bucle infinito
      if (!config.retry) {
        config.retry = true;
        console.log(`Reintentando con ${fallbackApiUrl}`);
        return api(config);
      }
    }
    
    // Manejo de error 401 (no autorizado)
    if (error.response?.status === 401) {
      console.warn("⚠️ No autorizado, redirigir al login si hace falta");
      // window.location.href = "/login"; // opcional
    }
    
    return Promise.reject(error);
  }
);

export default api;