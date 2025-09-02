// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  // Todas las llamadas del cliente irán al proxy genérico de Next
  baseURL: "/api/proxy",
  withCredentials: true, // para que envíe cookies si tu backend las usa
  headers: {
    "Content-Type": "application/json",
  },
  // Evita que el catálogo quede esperando indefinidamente cuando el backend está frío
  timeout: 10000,
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

// Interceptor de responses (manejo de errores globales)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ No autorizado, redirigir al login si hace falta");
      // window.location.href = "/login"; // opcional
    }
    return Promise.reject(error);
  }
);

export default api;