// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  // Usar rutas directas al backend, sin proxy
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000,
});

// Pequeña utilidad local para evitar import circular con auth.ts
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function clearLocalSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("mi_tienda_session");
    localStorage.removeItem("token");
  } catch {}
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  try {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?returnTo=${returnTo}`;
  } catch {
    window.location.href = "/login";
  }
}

// Decodificar payload del JWT sin validar firma (solo para leer exp)
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  // Considerar expirado si faltan menos de 10 segundos para evitar carreras
  return nowSec >= (payload.exp as number) - 10;
}

// Interceptor de requests (antes de enviar)
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? getToken() : null;

    // Si hay token, verificar expiración antes de enviar
    if (token) {
      if (isTokenExpired(token)) {
        // Limpiar y redirigir a login
        clearLocalSession();
        redirectToLogin();
        // Cancelar la request actual con un error controlado
        return Promise.reject(new axios.Cancel("Token expirado: redirigiendo a login"));
      }
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
    const status = error?.response?.status;
    if (status === 401) {
      // Si el backend indica token expirado/no válido, limpiar y redirigir
      clearLocalSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;