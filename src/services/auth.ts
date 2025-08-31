// src/services/auth.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Interfaces para DTOs
export interface RevendedorRegisterDto {
  nombre_negocio: string;
  nombre: string;
  apellido: string;
  condicion_fiscal: 'monotributista' | 'exento' | 'responsable_inscripto';
  email: string;
  telefono: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    tipo: 'admin' | 'revendedor';
  };
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tipo: 'admin' | 'revendedor';
  telefono?: string;
  direccion?: string;
  nombre_negocio?: string;
  condicion_fiscal?: string;
}

// Nuevas interfaces para códigos de activación
export interface SolicitarCodigoDto {
  email: string;
  nombreTienda: string;
  telefono: string;
  descripcionNegocio: string;
}

export interface RegistroConCodigoDto {
  codigo: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion?: string;
  password: string;
}

export interface CodigoValidationResponse {
  valido: boolean;
  email?: string;
  nombreTienda?: string;
  expiresAt?: string;
}

export interface ContactoComercialDto {
  nombre: string;
  email: string;
  telefono: string;
  tipoNegocio: string;
  descripcion: string;
  presupuesto: string;
}

export interface SecurityStats {
  intentosFallidos24h: number;
  ipsBloquedas: number;
  intentosPorHora: Array<{ hora: string; intentos: number }>;
  topIpsSospechosas: Array<{ ip: string; intentos: number }>;
}

/**
 * Servicio de Autenticación Centralizado
 * Maneja la persistencia de sesión y validación automática de tokens
 */
class AuthService {
  private API_URL: string;
  private USER_TYPE_KEY: string;
  private USER_PROFILE_KEY: string;

  constructor() {
    this.API_URL = API_BASE_URL;
    this.USER_TYPE_KEY = 'userType';
    this.USER_PROFILE_KEY = 'userProfile';
    
    // Configurar validación automática cada 5 minutos
    this.setupAutoValidation();
  }

  /**
   * Realizar login y guardar datos de sesión
   */
  async login(email: string, password: string, userType = 'admin'): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      // Solo guardar datos del usuario (no el token, se maneja por cookie)
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.USER_TYPE_KEY, data.user.tipo);
        localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(data.user));
      }
      
      console.log('✅ Sesión iniciada correctamente');
      return data;
    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  }

  /**
   * Cerrar sesión y limpiar datos
   */
  async logout() {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Llamar al endpoint de logout para limpiar la cookie
      await fetch(`${this.API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Incluir cookies
      });
    } catch (error) {
      console.warn('⚠️ Error al cerrar sesión en el servidor:', error);
    }
    
    // Limpiar datos locales (ya no manejamos token)
    localStorage.removeItem(this.USER_TYPE_KEY);
    localStorage.removeItem(this.USER_PROFILE_KEY);
    
    console.log('✅ Sesión cerrada correctamente');
    
    // Redireccionar según el tipo de usuario
    const currentPath = window.location.pathname;
    if (currentPath.includes('admin')) {
      window.location.href = '/login';
    } else if (currentPath.includes('revendedor')) {
      window.location.href = '/login';
    } else {
      window.location.href = '/login';
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Con cookies, la autenticación se verifica automáticamente en cada request
    // Solo verificamos si tenemos datos del usuario guardados localmente
    const userProfile = localStorage.getItem(this.USER_PROFILE_KEY);
    return !!userProfile;
  }

  /**
   * Obtener el token actual (ya no se usa con cookies)
   */
  getToken(): string | null {
    // Con cookies, no necesitamos manejar tokens manualmente
    return null;
  }

  /**
   * Obtener el perfil del usuario
   */
  getUserProfile(): UserProfile | null {
    if (typeof window === 'undefined' || !this.isAuthenticated()) {
      return null;
    }
    
    const profile = localStorage.getItem(this.USER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  }

  /**
   * Obtener el tipo de usuario
   */
  getUserType(): 'admin' | 'revendedor' | null {
    if (typeof window === 'undefined' || !this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem(this.USER_TYPE_KEY) as 'admin' | 'revendedor' | null;
  }

  /**
   * Validar autenticación con el servidor usando cookies
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${this.API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies
      });

      if (response.ok) {
        // Autenticación válida
        return true;
      } else if (response.status === 401 || response.status === 403) {
        // Solo hacer logout si es un error de autenticación específico
        console.log('⚠️ Autenticación inválida en el servidor');
        this.logout();
        return false;
      } else {
        // Para otros errores (500, 502, etc.), no hacer logout automático
        console.warn('⚠️ Error del servidor al validar token, manteniendo sesión:', response.status);
        return true; // Mantener la sesión activa
      }
    } catch (error) {
      // Errores de red no deberían cerrar la sesión
      console.warn('⚠️ Error de red al validar token, manteniendo sesión:', error);
      return true; // Mantener la sesión activa
    }
  }

  /**
   * Realizar petición autenticada usando cookies
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Incluir cookies
    });

    // Si la autenticación es inválida, cerrar sesión
    if (response.status === 401) {
      console.log('⚠️ Autenticación rechazada por el servidor');
      this.logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }

  /**
   * Configurar validación automática del token
   */
  setupAutoValidation() {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Validar token cada 5 minutos
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.validateToken();
      }
    }, 5 * 60 * 1000);

    // Validar token cuando la página se enfoca
    window.addEventListener('focus', () => {
      if (this.isAuthenticated()) {
        this.validateToken();
      }
    });

    // Validar token cuando se carga la página
    document.addEventListener('DOMContentLoaded', () => {
      if (this.isAuthenticated()) {
        this.validateToken();
      }
    });
  }

  /**
   * Verificar autenticación y redireccionar si es necesario
   */
  requireAuth(redirectUrl: string | null = null): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    if (!this.isAuthenticated()) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // Redireccionar según el contexto
        const currentPath = window.location.pathname;
        if (currentPath.includes('admin')) {
          window.location.href = '/login';
        } else if (currentPath.includes('revendedor')) {
          window.location.href = '/login';
        } else {
          window.location.href = '/login';
        }
      }
      return false;
    }
    return true;
  }

  /**
   * Renovar token automáticamente
   */
  async renewToken(): Promise<boolean> {
    try {
      const response = await this.authenticatedFetch(`${this.API_URL}/auth/refresh`, {
        method: 'POST'
      });

      if (response.ok) {
        // Con autenticación por cookies, no necesitamos almacenar el token ni expiración
        console.log('✅ Sesión renovada correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error renovando token:', error);
    }
    return false;
  }

  // Registro de revendedor
  async registerRevendedor(data: RevendedorRegisterDto): Promise<AuthResponse> {
    const response = await fetch(`${this.API_URL}/auth/register/revendedor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar revendedor');
    }

    return response.json();
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${this.API_URL}/auth/profile`, {
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    return response.json();
  }

  // Guardar datos de autenticación
  saveAuthData(authResponse: AuthResponse) {
    // Con cookies, solo persistimos información no sensible del usuario
    localStorage.setItem(this.USER_TYPE_KEY, authResponse.user.tipo);
    localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(authResponse.user));
  }

  // Obtener datos del usuario guardados
  getSavedUserProfile(): UserProfile | null {
    const profile = localStorage.getItem(this.USER_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  }

  // Solicitar código de activación
  async solicitarCodigo(data: SolicitarCodigoDto): Promise<{ message: string; codigo?: string }> {
    const response = await fetch(`${this.API_URL}/auth/solicitar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al solicitar código de activación');
    }

    return response.json();
  }

  // Validar código de activación (preview sin registrar)
  async validarCodigoPreview(codigo: string, email: string): Promise<CodigoValidationResponse> {
    const response = await fetch(`${this.API_URL}/auth/validar-codigo-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo, email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al validar código');
    }

    return response.json();
  }

  // Validar código de activación
  async validarCodigo(codigo: string): Promise<CodigoValidationResponse> {
    const response = await fetch(`${this.API_URL}/auth/validar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al validar código');
    }

    return response.json();
  }

  // Registrar administrador con código
  async registrarConCodigo(data: RegistroConCodigoDto): Promise<AuthResponse> {
    const response = await fetch(`${this.API_URL}/auth/register/admin-con-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Manejar error específico de token requerido
      if (response.status === 401 && errorData.message === 'Token de acceso requerido') {
        throw new Error('El servidor backend requiere configuración. El endpoint de registro debe ser público. Contacte al administrador del sistema.');
      }
      
      throw new Error(errorData.message || 'Error al registrar con código');
    }

    return response.json();
  }

  // Contacto comercial
  async enviarContactoComercial(data: ContactoComercialDto): Promise<{ message: string }> {
    const response = await fetch(`${this.API_URL}/contacto/solicitar-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al enviar solicitud de contacto');
    }

    return response.json();
  }

  // Estadísticas de seguridad (solo para administradores)
  async getSecurityStats(): Promise<SecurityStats> {
    const token = this.getToken();
    const response = await fetch(`${this.API_URL}/auth/security/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener estadísticas de seguridad');
    }

    return response.json();
  }
}

// Crear instancia global del servicio de autenticación
export const authService = new AuthService();

// Hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
  (window as any).authService = authService;
}