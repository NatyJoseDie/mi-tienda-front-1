'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, Ban, RefreshCw, X } from 'lucide-react';

export interface SecurityError {
  type: 'rate_limit' | 'ip_blocked' | 'invalid_code' | 'suspicious_activity' | 'session_expired';
  message: string;
  details?: string;
  retryAfter?: number; // segundos hasta poder reintentar
  blockDuration?: number; // duración del bloqueo en segundos
  attemptsRemaining?: number;
  maxAttempts?: number;
}

interface SecurityHandlerProps {
  error: SecurityError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const SecurityHandler: React.FC<SecurityHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      if (error.retryAfter) {
        setCountdown(error.retryAfter);
      }
    } else {
      setIsVisible(false);
      setCountdown(0);
    }
  }, [error]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getErrorConfig = (error: SecurityError) => {
    switch (error.type) {
      case 'rate_limit':
        return {
          icon: Clock,
          title: 'Límite de Intentos Alcanzado',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'ip_blocked':
        return {
          icon: Ban,
          title: 'IP Bloqueada',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'invalid_code':
        return {
          icon: AlertTriangle,
          title: 'Código Inválido',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          textColor: 'text-orange-700',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
        };
      case 'suspicious_activity':
        return {
          icon: Shield,
          title: 'Actividad Sospechosa Detectada',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-800',
          textColor: 'text-purple-700',
          buttonColor: 'bg-purple-600 hover:bg-purple-700',
        };
      case 'session_expired':
        return {
          icon: Clock,
          title: 'Sesión Expirada',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Error de Seguridad',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          textColor: 'text-gray-700',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRetry = () => {
    if (countdown === 0 && onRetry) {
      onRetry();
    }
  };

  if (!error || !isVisible) {
    return null;
  }

  const config = getErrorConfig(error);
  const IconComponent = config.icon;
  const canRetry = countdown === 0 && onRetry;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${config.titleColor}`}>
                {config.title}
              </h3>
            </div>
          </div>
          
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={`${config.textColor} hover:opacity-70 transition-opacity`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className={`${config.textColor} text-sm leading-relaxed`}>
            {error.message}
          </p>
          
          {error.details && (
            <p className={`${config.textColor} text-xs mt-2 opacity-80`}>
              {error.details}
            </p>
          )}
        </div>

        {/* Progress indicators */}
        {error.attemptsRemaining !== undefined && error.maxAttempts && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className={config.textColor}>Intentos restantes</span>
              <span className={config.textColor}>
                {error.attemptsRemaining}/{error.maxAttempts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  error.attemptsRemaining > 0 ? config.buttonColor.split(' ')[0] : 'bg-red-500'
                }`}
                style={{
                  width: `${(error.attemptsRemaining / error.maxAttempts) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Countdown */}
        {countdown > 0 && (
          <div className="mb-4">
            <div className={`text-center p-3 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${config.iconColor}`} />
                <span className={`text-sm font-medium ${config.titleColor}`}>
                  Tiempo de espera
                </span>
              </div>
              <div className={`text-2xl font-bold ${config.titleColor}`}>
                {formatTime(countdown)}
              </div>
              <p className={`text-xs ${config.textColor} mt-1`}>
                Podrás intentar nuevamente cuando termine el tiempo
              </p>
            </div>
          </div>
        )}

        {/* Block duration info */}
        {error.blockDuration && (
          <div className="mb-4">
            <div className={`text-center p-3 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
              <p className={`text-sm ${config.textColor}`}>
                <strong>Duración del bloqueo:</strong> {formatTime(error.blockDuration)}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={!canRetry}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all
                ${canRetry
                  ? `${config.buttonColor} text-white`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <RefreshCw className={`w-4 h-4 ${!canRetry ? 'animate-spin' : ''}`} />
              {countdown > 0 ? 'Esperando...' : 'Reintentar'}
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${config.textColor} hover:bg-gray-100
              `}
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Security tips */}
        {(error.type === 'rate_limit' || error.type === 'invalid_code') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className={`text-sm font-medium ${config.titleColor} mb-2`}>
              Consejos de seguridad:
            </h4>
            <ul className={`text-xs ${config.textColor} space-y-1`}>
              <li>• Verifica que el código esté escrito correctamente</li>
              <li>• Asegúrate de usar el código más reciente</li>
              <li>• Los códigos tienen una validez limitada</li>
              {error.type === 'rate_limit' && (
                <li>• Evita múltiples intentos seguidos</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityHandler;

// Hook personalizado para manejar errores de seguridad
export const useSecurityHandler = () => {
  const [securityError, setSecurityError] = useState<SecurityError | null>(null);

  const handleSecurityError = (error: SecurityError) => {
    setSecurityError(error);
  };

  const clearSecurityError = () => {
    setSecurityError(null);
  };

  const parseApiError = (apiError: any): SecurityError | null => {
    if (!apiError) return null;

    // Detectar diferentes tipos de errores basados en el mensaje o código
    const message = apiError.message || apiError.error || 'Error de seguridad';
    const code = apiError.code || apiError.status || apiError.response?.status;
    
    // Manejar errores de red específicamente
    if (message.includes('Network Error') || message.includes('fetch') || code === 'NETWORK_ERROR') {
      return {
        type: 'suspicious_activity',
        message: 'Error de conexión con el servidor',
        details: 'Verifica tu conexión a internet o intenta nuevamente en unos momentos',
        retryAfter: 30,
      };
    }

    if (message.includes('rate limit') || code === 429) {
      return {
        type: 'rate_limit',
        message: 'Has excedido el límite de intentos permitidos',
        details: 'Por favor espera antes de intentar nuevamente',
        retryAfter: apiError.retryAfter || 60,
        attemptsRemaining: apiError.attemptsRemaining || 0,
        maxAttempts: apiError.maxAttempts || 5,
      };
    }

    if (message.includes('IP blocked') || message.includes('blocked') || code === 403) {
      return {
        type: 'ip_blocked',
        message: 'Tu dirección IP ha sido bloqueada temporalmente',
        details: 'Esto puede deberse a múltiples intentos fallidos',
        blockDuration: apiError.blockDuration || 3600,
      };
    }

    if (message.includes('invalid code') || message.includes('código inválido')) {
      return {
        type: 'invalid_code',
        message: 'El código ingresado no es válido',
        details: 'Verifica que el código esté escrito correctamente',
        attemptsRemaining: apiError.attemptsRemaining,
        maxAttempts: apiError.maxAttempts || 5,
      };
    }

    if (message.includes('suspicious') || code === 451) {
      return {
        type: 'suspicious_activity',
        message: 'Se ha detectado actividad sospechosa',
        details: 'Por seguridad, se ha restringido temporalmente el acceso',
        retryAfter: apiError.retryAfter || 300,
      };
    }

    if (message.includes('session') || message.includes('expired') || code === 401) {
      return {
        type: 'session_expired',
        message: 'Tu sesión ha expirado',
        details: 'Por favor inicia sesión nuevamente',
      };
    }

    return null;
  };

  return {
    securityError,
    handleSecurityError,
    clearSecurityError,
    parseApiError,
  };
};