/**
 * Utilidades para manejo de imágenes en la aplicación
 * Centraliza la lógica de normalización de URLs y proxy para Supabase
 */

/**
 * Normaliza posibles duplicaciones de '/product-images/' en URLs provenientes de Supabase Storage
 * @param url URL de imagen a normalizar
 * @returns URL normalizada sin duplicaciones de carpetas
 */
export const normalizeSupabaseImageUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/product-images\/(?:product-images\/)+/g, '/product-images/').trim();
};

/**
 * Obtiene una imagen segura: normaliza si viene de Supabase, aplica proxy si es necesario y placeholder local como fallback
 * @param url URL de imagen a procesar
 * @param placeholderPath Ruta al placeholder por defecto (opcional)
 * @returns URL segura para usar en componentes de imagen
 */
export const getSafeImage = (url: string | null | undefined, placeholderPath: string = '/placeholder.jpg'): string => {
  if (!url) return placeholderPath;
  if (url.includes('placehold.co')) return placeholderPath;
  const normalized = normalizeSupabaseImageUrl(url);
  if (!normalized) return placeholderPath;
  return resolveImageUrl(normalized) || placeholderPath;
};

/**
 * Resuelve una URL de imagen, aplicando normalización, proxy para Supabase y prefijo de backend si es necesario
 * @param url URL de imagen a resolver
 * @param backendBase URL base del backend (opcional, por defecto usa NEXT_PUBLIC_API_URL o localhost:3000)
 * @returns URL resuelta lista para usar en componentes de imagen
 */
export const resolveImageUrl = (url?: string | null, backendBase?: string): string => {
  if (!url) return '';
  const normalized = normalizeSupabaseImageUrl(url);
  if (!normalized) return '';
  
  console.log('Resolving image URL:', { original: url, normalized, isSupabase: normalized.includes('.supabase.co/') });
  
  // Si es una URL absoluta (comienza con http)
  if (normalized.startsWith('http')) {
    // Si es Supabase Storage, usar el proxy interno para evitar ORB
    if (normalized.includes('.supabase.co/')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(normalized)}`;
      console.log('Using proxy for Supabase:', proxyUrl);
      return proxyUrl;
    }
    console.log('Returning absolute non-Supabase URL:', normalized);
    return normalized;
  }
  
  // Si es una ruta relativa, añadir el prefijo del backend
  const base = backendBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const finalUrl = `${base}${normalized}`;
  console.log('Returning relative URL with base:', finalUrl);
  return finalUrl;
};