"use client";

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
}

/**
 * Hace login contra el backend
 */
export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Credenciales inválidas");
    }

    const data = await res.json();
    setSession(data.token, data.role);
    return data;
  } catch (err) {
    console.error("Error en login:", err);
    throw err;
  }
}

/**
 * Logout local
 */
export function logout() {
  clearSession();
  window.location.href = "/"; // te lleva al home
}

/**
 * Fetch con autenticación automática
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const { token } = getSession();

  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // token inválido → forzar logout
    clearSession();
    window.location.href = "/login";
  }

  return res;
}