'use client';

import React, { useState } from 'react';
import { CheckIcon, StarIcon, CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';
import { solicitarInfoPlanes } from '@/lib/api-client';

interface ContactoConPlanesForm {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  planSeleccionado: 'free' | 'basic' | 'premium' | 'enterprise';
}

interface Plan {
  id: 'free' | 'basic' | 'premium' | 'enterprise';
  nombre: string;
  precio: string;
  descripcion: string;
  caracteristicas: string[];
  color: string;
  popular?: boolean;
  icon: any;
}

const planes: Plan[] = [
  {
    id: 'free',
    nombre: 'Plan Gratuito',
    precio: 'Gratis',
    descripcion: 'Perfecto para empezar tu negocio',
    caracteristicas: [
      'Hasta 50 productos',
      'Tienda básica personalizable',
      'Carrito de compras',
      'Gestión de pedidos',
      'SSL incluido',
      'Responsive Design'
    ],
    color: 'from-green-500 to-emerald-600',
    icon: GiftIcon
  },
  {
    id: 'basic',
    nombre: 'Plan Básico',
    precio: '$2.999/mes',
    descripcion: 'Ideal para negocios en crecimiento',
    caracteristicas: [
      'Hasta 200 productos',
      'Tienda completamente personalizable',
      'Dominio personalizado incluido',
      'Gestión avanzada de inventario',
      'Reportes básicos',
      'Soporte por email',
      'Integración con redes sociales',
      'Almacenamiento 5GB'
    ],
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    icon: StarIcon
  },
  {
    id: 'premium',
    nombre: 'Plan Profesional',
    precio: '$5.999/mes',
    descripcion: 'Para negocios establecidos que buscan crecer',
    caracteristicas: [
      'Productos ilimitados',
      'Múltiples métodos de pago',
      'Gestión de vendedores',
      'Reportes avanzados y analytics',
      'Email marketing integrado',
      'Soporte telefónico',
      'Backup automático',
      'API personalizada'
    ],
    color: 'from-purple-500 to-pink-600',
    icon: CreditCardIcon
  },
  {
    id: 'enterprise',
    nombre: 'Plan Empresarial',
    precio: '$9.999/mes',
    descripcion: 'Solución completa para grandes empresas',
    caracteristicas: [
      'Todo del Plan Profesional',
      'Múltiples tiendas',
      'Gestión de usuarios y roles',
      'Integración con ERP/CRM',
      'Soporte 24/7 dedicado',
      'Consultoría personalizada',
      'Almacenamiento ilimitado',
      'SLA garantizado'
    ],
    color: 'from-gray-700 to-gray-900',
    icon: CreditCardIcon
  }
];

const PaquetesPage: React.FC = () => {
  const [planSeleccionado, setPlanSeleccionado] = useState<'free' | 'basic' | 'premium' | 'enterprise' | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<ContactoConPlanesForm>({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
    planSeleccionado: 'free'
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanSelect = (planId: 'free' | 'basic' | 'premium' | 'enterprise') => {
    setPlanSeleccionado(planId);
    setFormData({ ...formData, planSeleccionado: planId });
    setMostrarFormulario(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    try {
      // Paso 1: Enviar solicitud
      const data = await solicitarInfoPlanes({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        mensaje: formData.mensaje,
        planSeleccionado: formData.planSeleccionado
      });

      // Paso 2: Procesar respuesta y redirigir al link de pago
        
        if (planSeleccionado === 'free') {
          setMensaje('✅ ¡Solicitud enviada exitosamente! Hemos enviado un código de activación a tu email. Revisa tu bandeja de entrada (y spam) para comenzar con el plan gratuito.');
          setFormData({
            nombre: '',
            email: '',
            telefono: '',
            mensaje: '',
            planSeleccionado: 'free'
          });
          setMostrarFormulario(false);
          setPlanSeleccionado(null);
        } else {
          // Para planes pagos, verificar si hay link de pago
          if (data.success && data.solicitud && data.solicitud.link_pago) {
            // Redirigir al link de pago
            window.location.href = data.solicitud.link_pago;
          } else {
            setMensaje('✅ ¡Solicitud enviada exitosamente! Hemos notificado al administrador sobre tu interés en el plan seleccionado. Recibirás un email con los detalles de pago y activación en las próximas 24 horas.');
            setFormData({
              nombre: '',
              email: '',
              telefono: '',
              mensaje: '',
              planSeleccionado: 'free'
            });
            setMostrarFormulario(false);
            setPlanSeleccionado(null);
          }
        }
    } catch (error) {
      setMensaje('❌ Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const getDisplayPrice = (plan: Plan) => {
    if (plan.id === 'free') return plan.precio;
    if (!isAnnual) return plan.precio;
    
    // Calcular precio anual con descuento del 20%
    const monthlyPrice = parseInt(plan.precio.replace(/[^0-9]/g, ''));
    const annualPrice = Math.round(monthlyPrice * 12 * 0.8);
    return `$${annualPrice.toLocaleString()}/año`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elige el Plan Perfecto para tu Negocio
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Desde planes gratuitos hasta soluciones empresariales completas
          </p>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md transition-all ${
                !isAnnual
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md transition-all ${
                isAnnual
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Anual
              <span className="ml-2 bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {mensaje && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
              {mensaje}
            </div>
          </div>
        )}

        {!mostrarFormulario ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planes.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-lg shadow-lg border ${
                    plan.popular 
                      ? 'border-blue-500 ring-2 ring-blue-100' 
                      : 'border-gray-200'
                  } hover:shadow-xl transition-shadow duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Más Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} mb-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4">{plan.descripcion}</p>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {getDisplayPrice(plan)}
                      </div>
                      {isAnnual && plan.id !== 'free' && (
                        <div className="text-sm text-green-600 font-medium">
                          Ahorra 20% al año
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.caracteristicas.map((caracteristica, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {caracteristica}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.id === 'free'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {planSeleccionado === 'free' ? 'Activar Plan Gratuito' : 'Solicitar Información'}
              </h2>
              <p className="text-gray-600">
                {planes.find(p => p.id === planSeleccionado)?.nombre}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Cuéntanos sobre tu negocio y qué esperas lograr con tu tienda online..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setPlanSeleccionado(null);
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    planSeleccionado === 'free'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {enviando ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    planSeleccionado === 'free' ? 'Activar Plan Gratuito' : 'Enviar Solicitud'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaquetesPage;