import { useState, useEffect } from 'react';
import { configuracionAPI } from '@/services/configuracion';

interface ConfiguracionVisual {
  logo_url?: string;
  favicon_url?: string;
  banner_url?: string;
  color_primario?: string;
  color_secundario?: string;
  color_acento?: string;
  fuente_principal?: string;
}

interface ConfiguracionNegocio {
  nombre_tienda?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  horarios?: string;
  redes_sociales?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

interface ConfiguracionCompleta {
  visual: ConfiguracionVisual;
  negocio: ConfiguracionNegocio;
}

export const useConfiguracion = () => {
  const [config, setConfig] = useState<ConfiguracionCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await configuracionAPI.obtenerConfiguracion();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actualizarConfig = async (nuevaConfig: ConfiguracionCompleta) => {
    try {
      setError(null);
      const data = await configuracionAPI.actualizarConfiguracion(nuevaConfig as unknown as Record<string, unknown>);
      setConfig(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  const subirArchivo = async (tipo: 'logo' | 'favicon' | 'banner', archivo: File) => {
    try {
      setError(null);
      let data;
      
      switch (tipo) {
        case 'logo':
          data = await configuracionAPI.subirLogo(archivo);
          break;
        case 'favicon':
          data = await configuracionAPI.subirFavicon(archivo);
          break;
        case 'banner':
          data = await configuracionAPI.subirBanner(archivo);
          break;
      }
      
      // Actualizar la configuración local con la nueva URL
      if (config) {
        const configActualizada = {
          ...config,
          visual: {
            ...config.visual,
            [`${tipo}_url`]: data.url
          }
        };
        setConfig(configActualizada);
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  const restablecerConfiguracion = async () => {
    try {
      setError(null);
      await configuracionAPI.restablecerConfiguracion();
      await cargarConfiguracion(); // Recargar la configuración después de restablecer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  return {
    config,
    loading,
    error,
    actualizarConfig,
    subirArchivo,
    restablecerConfiguracion,
    recargar: cargarConfiguracion
  };
};

export default useConfiguracion;