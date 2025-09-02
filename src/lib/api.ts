// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://mi-tienda-backend-o9i7.onrender.com", // ✅ tu backend en Render
  withCredentials: true, // para que envíe cookies si tu backend las usa
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requests (antes de enviar)
api.interceptors.request.use(
  (config) => {
    // Ejemplo: agregar token si lo guardás en localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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