'use client';

import React, { useState } from 'react';
import { Mail, Store, Send, CheckCircle, AlertCircle, Phone, FileText } from 'lucide-react';
import SecurityHandler, { useSecurityHandler } from './SecurityHandler';
import { solicitarCodigo } from '@/lib/api-client';

interface SolicitarCodigoDto {
  email: string;
  nombreTienda: string;
  telefono: string;
  descripcionNegocio: string;
}

interface SolicitarCodigoProps {
  onSuccess?: (data: { email: string; nombreTienda: string; telefono: string; descripcionNegocio: string; codigo?: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const SolicitarCodigo: React.FC<SolicitarCodigoProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const { securityError, handleSecurityError, clearSecurityError, parseApiError } = useSecurityHandler();
  const [formData, setFormData] = useState<SolicitarCodigoDto>({
    email: '',
    nombreTienda: '',
    telefono: '',
    descripcionNegocio: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<SolicitarCodigoDto>>({});

  const validateForm = (): boolean => {
    const errors: Partial<SolicitarCodigoDto> = {};

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar nombre de tienda
    if (!formData.nombreTienda) {
      errors.nombreTienda = 'El nombre de la tienda es requerido';
    } else if (formData.nombreTienda.length < 3) {
      errors.nombreTienda = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombreTienda.length > 50) {
      errors.nombreTienda = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar teléfono
    if (!formData.telefono) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-()]{8,15}$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    // Validar descripción del negocio
    if (!formData.descripcionNegocio) {
      errors.descripcionNegocio = 'La descripción del negocio es requerida';
    } else if (formData.descripcionNegocio.length < 10) {
      errors.descripcionNegocio = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcionNegocio.length > 500) {
      errors.descripcionNegocio = 'La descripción no puede exceder 500 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof SolicitarCodigoDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Limpiar error general
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    clearSecurityError();

    try {
      const responseData = await solicitarCodigo({
        email: formData.email,
        nombreTienda: formData.nombreTienda,
        tipoNegocio: formData.descripcionNegocio,
        descripcion: formData.descripcionNegocio
      });
      
      setSuccess(true);
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess({
          email: formData.email,
          nombreTienda: formData.nombreTienda,
          telefono: formData.telefono,
          descripcionNegocio: formData.descripcionNegocio,
          codigo: responseData.codigo, // Solo en modo desarrollo
        });
      }
      
    } catch (err: any) {
      // Verificar si es un error de seguridad
      const secError = parseApiError(err);
      if (secError) {
        handleSecurityError(secError);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error al solicitar código';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', nombreTienda: '', telefono: '', descripcionNegocio: '' });
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Código Enviado!
          </h3>
          <p className="text-gray-600 mb-4">
            Hemos enviado un código de activación a <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Revisa tu bandeja de entrada y carpeta de spam. El código expira en 24 horas.
          </p>
          
          {/* Mostrar código en modo desarrollo */}
          {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Modo Desarrollo:</strong> Tu código es visible aquí para testing
              </p>
            </div>
          )}
          
          <button
            onClick={resetForm}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            Solicitar otro código
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <Store className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Solicitar Código de Activación
        </h2>
        <p className="text-gray-600">
          Ingresa tus datos para recibir un código de activación y crear tu tienda
        </p>
      </div>

      {/* Error de seguridad */}
      {securityError && (
        <SecurityHandler 
          error={securityError} 
          onRetry={clearSecurityError}
          onDismiss={clearSecurityError}
        />
      )}

      {/* Error general */}
      {error && !securityError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Nombre de Tienda */}
        <div>
          <label htmlFor="nombreTienda" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de tu Tienda *
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="nombreTienda"
              type="text"
              value={formData.nombreTienda}
              onChange={(e) => handleInputChange('nombreTienda', e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                ${validationErrors.nombreTienda ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Mi Tienda Online"
              disabled={loading}
              maxLength={50}
            />
          </div>
          {validationErrors.nombreTienda && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.nombreTienda}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {formData.nombreTienda.length}/50 caracteres
          </p>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                ${validationErrors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="+1 234 567 8900"
              disabled={loading}
            />
          </div>
          {validationErrors.telefono && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.telefono}</p>
          )}
        </div>

        {/* Descripción del Negocio */}
        <div>
          <label htmlFor="descripcionNegocio" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción del Negocio *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              id="descripcionNegocio"
              value={formData.descripcionNegocio}
              onChange={(e) => handleInputChange('descripcionNegocio', e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none
                ${validationErrors.descripcionNegocio ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Describe brevemente tu negocio, productos o servicios..."
              disabled={loading}
              maxLength={500}
              rows={3}
            />
          </div>
          {validationErrors.descripcionNegocio && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.descripcionNegocio}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {formData.descripcionNegocio.length}/500 caracteres
          </p>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            text-white
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Solicitar Código
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          ¿Ya tienes un código?{' '}
          <a href="/registro-admin" className="text-blue-600 hover:text-blue-800 font-medium">
            Registrarse aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default SolicitarCodigo;