import api from '@/lib/api';

export const configuracionAPI = {
  // Obtener configuración general
  obtenerConfiguracion: async () => {
    try {
      const res = await api.get('/configuracion');
      const data = res.data;
      if (!data || (typeof data === 'string' && data.trim() === '')) {
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
      return data;
    } catch (error) {
      console.error('Error al obtener configuración:', error);
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
      const res = await api.get('/configuracion/visual');
      const data = res.data;
      if (!data || (typeof data === 'string' && data.trim() === '')) {
        return {
          color_primario: '#3B82F6',
          color_secundario: '#64748B',
          fuente_principal: 'Inter'
        };
      }
      return data;
    } catch (error) {
      console.error('Error al obtener configuración visual:', error);
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
      const res = await api.get('/configuracion/negocio');
      const data = res.data;
      if (!data || (typeof data === 'string' && data.trim() === '')) {
        return {
          nombre_tienda: 'Mi Tienda',
          descripcion: 'Descripción de la tienda',
          redes_sociales: {}
        };
      }
      return data;
    } catch (error) {
      console.error('Error al obtener configuración de negocio:', error);
      return {
        nombre_tienda: 'Mi Tienda',
        descripcion: 'Descripción de la tienda',
        redes_sociales: {}
      };
    }
  },

  // Actualizar configuración
  actualizarConfiguracion: async (data: Record<string, unknown>) => {
    const res = await api.put('/configuracion', data);
    return res.data;
  },

  // Subir logo
  subirLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/configuracion/logo', formData);
    return res.data;
  },

  // Subir favicon
  subirFavicon: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/configuracion/favicon', formData);
    return res.data;
  },

  // Subir banner
  subirBanner: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/configuracion/banner', formData);
    return res.data;
  },

  // Restablecer configuración
  restablecerConfiguracion: async () => {
    const res = await api.post('/configuracion/restablecer');
    return res.data;
  },

  // Obtener todas las configuraciones
  obtenerTodasConfiguraciones: async () => {
    const res = await api.get('/configuracion/todas');
    return res.data;
  }
};