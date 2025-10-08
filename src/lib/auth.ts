"use client";

import api from "./api";

export type UserSession = {
  token: string | null;
  role: string | null;
};

const STORAGE_KEY = "mi_tienda_session";

// Normaliza el rol a valores controlados: 'admin' | 'revendedor' | 'user'
function normalizeRole(raw?: string | null): 'admin' | 'revendedor' | 'user' {
  if (!raw) return 'user';
  const r = String(raw).toLowerCase().trim();
  // Coincidencias exactas o habituales
  if ([
    'admin', 'administrator', 'administrador', 'adm', 'root', 'sysadmin', 'superadmin', 'super-admin'
  ].includes(r)) return 'admin';
  if ([
    'revendedor', 'revendedores', 'reseller', 'seller', 'vendedor', 'distribuidor', 'mayorista'
  ].includes(r)) return 'revendedor';
  // Coincidencias por patrón comunes del backend (role_admin, admin_role, etc.)
  if (r.includes('admin')) return 'admin';
  if (r.includes('resell') || r.includes('revend') || r.includes('seller') || r.includes('vendor')) return 'revendedor';
  return 'user';
}

/**
 * Guarda la sesión en localStorage
 */
export function setSession(token: string, role: string) {
  const session: UserSession = { token, role: normalizeRole(role) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("token", token); // Para que lo use el interceptor de axios
}

/**
 * Obtiene la sesión actual
 */
export function getSession(): UserSession {
  if (typeof window === "undefined") return { token: null, role: null };
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { token: null, role: null };
  try {
    const parsed = JSON.parse(data) as UserSession;
    return { token: parsed.token, role: normalizeRole(parsed.role || undefined) };
  } catch {
    return { token: null, role: null };
  }
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

    if (data?.access_token) {
      // Setear token para siguientes requests
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

      // Si el login no trae el rol, lo consultamos al perfil
      let role: string | undefined = data.role;
      if (!role) {
        try {
          const profileRes = await api.get("/auth/profile");
          role = profileRes?.data?.role;
        } catch (e) {
          // Si falla el perfil, seguimos pero caerá en 'user' por normalización
          console.warn("No se pudo obtener el rol desde /auth/profile", e);
        }
      }

      const normRole = normalizeRole(role);
      setSession(data.access_token, normRole);
    }

    // Devolver también el rol normalizado para quien lo necesite en el flujo
    return { ...data, role: normalizeRole(data?.role) };
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
    const axiosConfig: any = {
      url,
      method: (options.method || 'GET') as any,
    };
    
    // Agregar datos si hay body
    if (options.body) {
      try {
        axiosConfig.data = JSON.parse(options.body as string);
      } catch {
        axiosConfig.data = options.body;
      }
    }
    
    const response = await api.request(axiosConfig);
    
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