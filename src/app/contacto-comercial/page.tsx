'use client';

import React, { useState } from 'react';
import { Mail, User, Phone, Building, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import SecurityHandler, { useSecurityHandler } from '@/components/SecurityHandler';
import { enviarContactoComercial } from '@/lib/api-client';

interface ValidationErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipoNegocio?: string;
  descripcion?: string;
  presupuesto?: string;
}

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  tipoNegocio: string;
  descripcion: string;
  presupuesto: string;
}

const ContactoComercial: React.FC = () => {
  const { securityError, handleSecurityError, clearSecurityError, parseApiError } = useSecurityHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    tipoNegocio: '',
    descripcion: '',
    presupuesto: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error de validación específico
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setError('');
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validar nombre
    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar teléfono
    if (!formData.telefono) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-()]{8,15}$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    // Validar tipo de negocio
    if (!formData.tipoNegocio) {
      errors.tipoNegocio = 'El tipo de negocio es requerido';
    }

    // Validar descripción
    if (!formData.descripcion) {
      errors.descripcion = 'La descripción del negocio es requerida';
    } else if (formData.descripcion.length < 20) {
      errors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    } else if (formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar presupuesto
    if (!formData.presupuesto) {
      errors.presupuesto = 'El presupuesto estimado es requerido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    clearSecurityError();

    try {
      await enviarContactoComercial({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        tipoNegocio: formData.tipoNegocio,
        descripcion: formData.descripcion,
        presupuesto: formData.presupuesto,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Error enviando contacto comercial:', err);
      
      // Verificar si es un error de seguridad
      const secError = parseApiError(err);
      if (secError) {
        handleSecurityError(secError);
      } else {
        setError(err.message || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      tipoNegocio: '',
      descripcion: '',
      presupuesto: '',
    });
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje Enviado!</h2>
          <p className="text-gray-600 mb-6">
            Gracias por tu interés. Nuestro equipo comercial se pondrá en contacto contigo pronto.
          </p>
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Enviar Otro Mensaje
            </button>
            <a
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-center"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contacto Comercial
          </h1>
          <p className="text-gray-600">
            ¿Interesado en nuestro sistema? Déjanos tus datos y nos pondremos en contacto contigo
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                    ${validationErrors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="Juan Pérez"
                  disabled={loading}
                  maxLength={100}
                />
              </div>
              {validationErrors.nombre && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.nombre}</p>
              )}
            </div>

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
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                    ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="juan@empresa.com"
                  disabled={loading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>

          {/* Teléfono y Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
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

            {/* Tipo de Negocio */}
            <div>
              <label htmlFor="tipoNegocio" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Negocio *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="tipoNegocio"
                  value={formData.tipoNegocio}
                  onChange={(e) => handleInputChange('tipoNegocio', e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                    ${validationErrors.tipoNegocio ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  disabled={loading}
                >
                  <option value="">Selecciona tu tipo de negocio</option>
                  <option value="retail">Retail/Tienda física</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="servicios">Servicios</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              {validationErrors.tipoNegocio && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.tipoNegocio}</p>
              )}
            </div>
          </div>

          {/* Descripción y Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Negocio *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none
                    ${validationErrors.descripcion ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="Describe tu negocio, productos, servicios, etc."
                  disabled={loading}
                  maxLength={500}
                  rows={4}
                />
              </div>
              {validationErrors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.descripcion}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.descripcion.length}/500 caracteres
              </p>
            </div>

            {/* Presupuesto */}
            <div>
              <label htmlFor="presupuesto" className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto Estimado *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="presupuesto"
                  value={formData.presupuesto}
                  onChange={(e) => handleInputChange('presupuesto', e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                    ${validationErrors.presupuesto ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  disabled={loading}
                >
                  <option value="">Selecciona tu presupuesto</option>
                  <option value="menos-1000">Menos de $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000-25000">$10,000 - $25,000</option>
                  <option value="mas-25000">Más de $25,000</option>
                </select>
              </div>
              {validationErrors.presupuesto && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.presupuesto}</p>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">¿Qué incluye nuestro sistema?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gestión completa de tiendas online</li>
              <li>• Sistema de códigos de activación seguro</li>
              <li>• Panel de administración avanzado</li>
              <li>• Soporte técnico especializado</li>
              <li>• Estadísticas y reportes en tiempo real</li>
            </ul>
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
                Enviar Mensaje
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            ¿Ya tienes un código de activación?{' '}
            <a href="/registro-admin" className="text-blue-600 hover:text-blue-800 font-medium">
              Registrarse aquí
            </a>
          </p>
          <p className="mt-2">
            ¿Necesitas solicitar un código?{' '}
            <a href="/solicitar-codigo" className="text-blue-600 hover:text-blue-800 font-medium">
              Solicitar código
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactoComercial;