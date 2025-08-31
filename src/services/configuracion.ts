const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const configuracionAPI = {
  // Obtener configuración general
  obtenerConfiguracion: async () => {
    try {
      const response = await fetch(`${API_BASE}/configuracion`);
      if (!response.ok) {
        throw new Error('Error al obtener configuración');
      }
      const text = await response.text();
      if (!text) {
        // Si no hay respuesta, devolver configuración por defecto
        return {
          visual: {
            color_primario: '#3B82F6',
            color_secundario: '#64748B',
            fuente_principal: 'Inter'
          },
          negocio: {
            nombre_tienda: 'Mi Tienda',
            descripcion: 'Descripción de la tienda',
            redes_sociales: {}
          }
        };
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      // Devolver configuración por defecto en caso de error
      return {
        visual: {
          color_primario: '#3B82F6',
          color_secundario: '#64748B',
          fuente_principal: 'Inter'
        },
        negocio: {
          nombre_tienda: 'Mi Tienda',
          descripcion: 'Descripción de la tienda',
          redes_sociales: {}
        }
      };
    }
  },

  // Obtener configuración visual
  obtenerConfiguracionVisual: async () => {
    try {
      const response = await fetch(`${API_BASE}/configuracion/visual`);
      if (!response.ok) {
        throw new Error('Error al obtener configuración visual');
      }
      const text = await response.text();
      if (!text) {
        return {
          color_primario: '#3B82F6',
          color_secundario: '#64748B',
          fuente_principal: 'Inter'
        };
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {
        color_primario: '#3B82F6',
        color_secundario: '#64748B',
        fuente_principal: 'Inter'
      };
    }
  },

  // Obtener configuración de negocio
  obtenerConfiguracionNegocio: async () => {
    try {
      const response = await fetch(`${API_BASE}/configuracion/negocio`);
      if (!response.ok) {
        throw new Error('Error al obtener configuración de negocio');
      }
      const text = await response.text();
      if (!text) {
        return {
          nombre_tienda: 'Mi Tienda',
          descripcion: 'Descripción de la tienda',
          redes_sociales: {}
        };
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {
        nombre_tienda: 'Mi Tienda',
        descripcion: 'Descripción de la tienda',
        redes_sociales: {}
      };
    }
  },

  // Actualizar configuración
  actualizarConfiguracion: async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE}/configuracion`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Incluir cookies
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Error al actualizar configuración');
    }
    return response.json();
  },

  // Subir logo
  subirLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/configuracion/logo`, {
      method: 'POST',
      credentials: 'include', // Incluir cookies
      body: formData
    });
    if (!response.ok) {
      throw new Error('Error al subir logo');
    }
    return response.json();
  },

  // Subir favicon
  subirFavicon: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/configuracion/favicon`, {
      method: 'POST',
      credentials: 'include', // Incluir cookies
      body: formData
    });
    if (!response.ok) {
      throw new Error('Error al subir favicon');
    }
    return response.json();
  },

  // Subir banner
  subirBanner: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/configuracion/banner`, {
      method: 'POST',
      credentials: 'include', // Incluir cookies
      body: formData
    });
    if (!response.ok) {
      throw new Error('Error al subir banner');
    }
    return response.json();
  },

  // Restablecer configuración
  restablecerConfiguracion: async () => {
    const response = await fetch(`${API_BASE}/configuracion/restablecer`, {
      method: 'POST',
      credentials: 'include' // Incluir cookies
    });
    if (!response.ok) {
      throw new Error('Error al restablecer configuración');
    }
    return response.json();
  },

  // Obtener todas las configuraciones
  obtenerTodasConfiguraciones: async () => {
    const response = await fetch(`${API_BASE}/configuracion/todas`);
    if (!response.ok) {
      throw new Error('Error al obtener todas las configuraciones');
    }
    return response.json();
  }
};