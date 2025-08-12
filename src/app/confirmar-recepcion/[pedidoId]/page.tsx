'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type EstadoUI = 'loading' | 'success' | 'error';

export default function ConfirmarRecepcionPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoUI>('loading');
  const [mensaje, setMensaje] = useState<string>('');

  useEffect(() => {
    const confirmar = async () => {
      try {
        const resp = await fetch(`${API_URL}/productos/pedidos/${pedidoId}/confirmar-recepcion`, {
          method: 'POST',
        });

        const text = await resp.text().catch(() => '');
        let data: any = null;
        try { data = JSON.parse(text); } catch {}

        if (resp.ok) {
          // Backend retorna { ok: true, mensaje } en nuestro controlador
          const msg = data?.mensaje || text || '¡Gracias! Confirmamos que recibiste tu pedido.';
          setMensaje(msg);
          setEstado('success');
          // Redirigir opcionalmente después de 6s
          setTimeout(() => router.push('/'), 6000);
        } else {
          // Si viene mensaje de "ya estaba confirmado", tratar como éxito amigable
          const msg = data?.mensaje || text || 'No se pudo confirmar la recepción';
          if (/ya estaba confirmado/i.test(msg)) {
            setMensaje(msg);
            setEstado('success');
            setTimeout(() => router.push('/'), 6000);
          } else {
            setMensaje(msg);
            setEstado('error');
          }
        }
      } catch (e: any) {
        setMensaje('No se pudo conectar con el servidor. Intenta más tarde.');
        setEstado('error');
      }
    };

    if (pedidoId) confirmar();
  }, [pedidoId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmación de recepción</h1>
        <p className="text-gray-500 mb-6">Pedido #{String(pedidoId).slice(-8)}</p>

        {estado === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-gray-700">Procesando tu confirmación...</p>
          </div>
        )}

        {estado === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">✓</div>
            <p className="text-green-700 font-medium">{mensaje || '¡Gracias! Confirmamos que recibiste tu pedido.'}</p>
            <p className="text-gray-500 text-sm">Serás redirigido al inicio en unos segundos...</p>
          </div>
        )}

        {estado === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">!</div>
            <p className="text-red-700 font-medium">{mensaje || 'No se pudo confirmar la recepción.'}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ir al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
