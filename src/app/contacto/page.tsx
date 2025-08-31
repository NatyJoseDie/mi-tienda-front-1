'use client';

import { useState } from 'react';

interface FormData {
  nombre: string;
  email: string;
  mensaje: string;
  esSolicitudCodigo: boolean;
}

export default function ContactoPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    mensaje: '',
    esSolicitudCodigo: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${API_URL}/contacto/solicitar-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ nombre: '', email: '', mensaje: '', esSolicitudCodigo: true });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al enviar el mensaje');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-green-800 mb-4">✅ Mensaje Enviado</h1>
          <p className="text-green-700 mb-4">
            Gracias por contactarnos. Te responderemos a tu email en las próximas 24-48 horas.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Ponete en Contacto</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        ¿Tenés alguna pregunta o consulta? Llená el formulario y te responderemos a la brevedad.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre Completo
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="nombre"
              id="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Tu nombre"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
            Mensaje
          </label>
          <div className="mt-1">
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              required
              value={formData.mensaje}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Escribí tu consulta acá..."
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </div>
      </form>
    </div>
  );
}