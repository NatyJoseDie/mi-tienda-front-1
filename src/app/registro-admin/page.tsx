'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Building, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SecurityHandler, { useSecurityHandler } from '@/components/SecurityHandler';

interface ValidationErrors {
  email?: string;
  codigo?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormData {
  codigo: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  password: string;
  confirmPassword: string;
}

const RegistroAdmin: React.FC = () => {
  const router = useRouter();
  const { securityError, handleSecurityError, clearSecurityError, parseApiError } = useSecurityHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    codigo: '',
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
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

    // Validar código (8 caracteres alfanuméricos)
    if (!formData.codigo) {
      errors.codigo = 'El código es requerido';
    } else if (!/^[A-Za-z0-9]{8}$/.test(formData.codigo)) {
      errors.codigo = 'El código debe tener 8 caracteres (letras y números)';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar nombre
    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formData.apellido) {
      errors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar teléfono (requerido)
    if (!formData.telefono) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-()]{8,15}$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    // Validar dirección (opcional)
    if (formData.direccion && formData.direccion.length < 5) {
      errors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/register-with-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: formData.codigo,
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          direccion: formData.direccion || undefined,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // Verificar si es un error de seguridad
      const secError = parseApiError(err);
      if (secError) {
        handleSecurityError(secError);
      } else {
        setError(err.message || 'Error al registrar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta ha sido creada exitosamente. Serás redirigido al login en unos segundos.
          </p>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registro de Administrador
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta de administrador con código de activación
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

          {/* Código */}
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código de Activación *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="codigo"
                type="text"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                  ${validationErrors.codigo ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="ABC12345"
                disabled={loading}
                maxLength={8}
              />
            </div>
            {validationErrors.codigo && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.codigo}</p>
            )}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                    ${validationErrors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="Juan"
                  disabled={loading}
                />
              </div>
              {validationErrors.nombre && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.nombre}</p>
              )}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                id="apellido"
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                  ${validationErrors.apellido ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="Pérez"
                disabled={loading}
              />
              {validationErrors.apellido && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.apellido}</p>
              )}
            </div>
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

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="direccion"
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                  ${validationErrors.direccion ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="Calle Falsa 123"
                disabled={loading}
              />
            </div>
            {validationErrors.direccion && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.direccion}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                  ${validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
                  ${validationErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

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
                Registrando...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroAdmin;