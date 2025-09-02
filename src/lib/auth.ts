"use client";

import api from "./api";

export type UserSession = {
  token: string | null;
  role: string | null;
};

const STORAGE_KEY = "mi_tienda_session";

/**
 * Guarda la sesión en localStorage
 */
export function setSession(token: string, role: string) {
  const session: UserSession = { token, role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("token", token); // Para que lo use el interceptor de axios
}

/**
 * Obtiene la sesión actual
 */
export function getSession(): UserSession {
  if (typeof window === "undefined") return { token: null, role: null };
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { token: null, role: null };
}

/**
 * Elimina la sesión
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("token"); // También eliminar el token para axios
}

/**
 * Hace login contra el backend
 */
export async function login(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    
    // Guardamos el token en localStorage para reutilizarlo
    if (data?.access_token) {
      setSession(data.access_token, data.role || "user");
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
    }
    
    return data;
  } catch (err) {
    console.error("Error en login:", err);
    throw err;
  }
}

/**
 * Registro de usuario
 */
export async function register(userData: {
  nombre: string;
  email: string;
  password: string;
  rol?: string; // por si necesitas definir admin/revendedor
}) {
  try {
    const { data } = await api.post("/auth/register", userData);
    return data;
  } catch (err) {
    console.error("Error en registro:", err);
    throw err;
  }
}

/**
 * Obtener perfil del usuario logueado
 */
export async function getProfile() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    const { data } = await api.get("/auth/profile");
    return data;
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    throw err;
  }
}

/**
 * Logout local
 */
export function logout() {
  clearSession();
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/"; // te lleva al home
}

/**
 * Función de utilidad para hacer peticiones autenticadas (mantener compatibilidad)
 */
export const authFetch = async (url: string, options: RequestInit = {}) => {
  try {
    // Usar el cliente API centralizado que ya maneja la autenticación
    const response = await api.request({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body as string) : undefined,
      ...options
    });
    
    // Simular la respuesta de fetch para compatibilidad
    return {
      ok: true,
      status: response.status,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data)
    } as Response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};