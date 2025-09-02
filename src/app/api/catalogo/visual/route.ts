// src/app/api/catalogo/visual/route.ts
import api from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await api.get('/catalogo/visual');
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Proxy error /api/catalogo/visual:', error?.response?.status, error?.message);
    const status = error?.response?.status || 500;
    return new Response(
      JSON.stringify({
        message: 'Error al obtener catálogo visual',
        error: error?.message || 'Unknown error',
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}