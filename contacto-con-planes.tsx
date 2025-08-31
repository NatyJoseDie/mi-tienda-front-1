import React, { useState } from 'react';

interface ContactoConPlanesForm {
  nombre: string;
  email: string;
  telefono: string;
  tipoNegocio: string;
  descripcion: string;
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
    color: 'bg-green-500'
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
    color: 'bg-blue-500',
    popular: true
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
    color: 'bg-pink-500'
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
    color: 'bg-gray-800'
  }
];

const ContactoConPlanes: React.FC = () => {
  const [formData, setFormData] = useState<ContactoConPlanesForm>({
    nombre: '',
    email: '',
    telefono: '',
    tipoNegocio: '',
    descripcion: '',
    planSeleccionado: 'basic'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handlePlanSelect = (planId: 'free' | 'basic' | 'premium' | 'enterprise') => {
    setFormData({ ...formData, planSeleccionado: planId });
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/contacto/solicitar-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const planSeleccionado = planes.find(p => p.id === formData.planSeleccionado);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Solicitud Enviada!</h2>
          <p className="text-gray-600 mb-4">
            Gracias por tu interés en el <strong>{planSeleccionado?.nombre}</strong>.
          </p>
          {formData.planSeleccionado === 'free' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">🎉 ¡Excelente elección!</p>
              <p className="text-green-700 text-sm mt-2">
                Te enviaremos tu código de acceso gratuito en las próximas 2-4 horas.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">💼 Nos pondremos en contacto contigo</p>
              <p className="text-blue-700 text-sm mt-2">
                Recibirás información detallada y un enlace de pago seguro en las próximas 24-48 horas.
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setSuccess(false);
              setMostrarFormulario(false);
              setFormData({
                nombre: '',
                email: '',
                telefono: '',
                tipoNegocio: '',
                descripcion: '',
                planSeleccionado: 'basic'
              });
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!mostrarFormulario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Elige tu Plan Perfecto
            </h1>
            <p className="text-xl text-blue-100">
              Comienza tu tienda online hoy mismo
            </p>
          </div>

          {/* Planes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                  plan.popular ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-yellow-400 text-center py-2">
                    <span className="text-sm font-bold text-gray-800">⭐ Más Popular</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl text-white">
                      {plan.id === 'free' ? '🎁' : 
                       plan.id === 'basic' ? '⭐' :
                       plan.id === 'premium' ? '💎' : '🏢'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2">{plan.nombre}</h3>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-gray-800">{plan.precio}</span>
                    {plan.precio !== 'Gratis' && <span className="text-gray-500">/mes</span>}
                  </div>
                  
                  <p className="text-gray-600 text-center mb-6">{plan.descripcion}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.id === 'free'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                    }`}
                  >
                    {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Garantías */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">🛡️ Garantías Incluidas</h3>
            <div className="grid md:grid-cols-3 gap-4 text-white">
              <div>
                <span className="text-2xl mb-2 block">🔒</span>
                <p className="font-semibold">Pago 100% Seguro</p>
                <p className="text-sm text-blue-100">Encriptación de nivel bancario</p>
              </div>
              <div>
                <span className="text-2xl mb-2 block">↩️</span>
                <p className="font-semibold">30 días de garantía</p>
                <p className="text-sm text-blue-100">Reembolso completo si no estás satisfecho</p>
              </div>
              <div>
                <span className="text-2xl mb-2 block">🚀</span>
                <p className="font-semibold">Activación inmediata</p>
                <p className="text-sm text-blue-100">Tu tienda lista en minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planSeleccionado = planes.find(p => p.id === formData.planSeleccionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <button
            onClick={() => setMostrarFormulario(false)}
            className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
          >
            ← Volver a planes
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📋 Información de Contacto
          </h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planSeleccionado?.color} text-white`}>
            {planSeleccionado?.nombre}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de negocio *
            </label>
            <select
              value={formData.tipoNegocio}
              onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona tu tipo de negocio</option>
              <option value="retail">Retail/Tienda física</option>
              <option value="mayorista">Mayorista</option>
              <option value="servicios">Servicios</option>
              <option value="manufactura">Manufactura</option>
              <option value="emprendimiento">Emprendimiento</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del negocio *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cuéntanos sobre tu negocio y qué productos/servicios ofreces..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar Solicitud"
            )}
          </button>
        </form>

        {formData.planSeleccionado === 'free' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm font-medium">🎉 Plan Gratuito seleccionado</p>
            <p className="text-green-700 text-xs mt-1">
              Recibirás tu código de acceso por email en las próximas 2-4 horas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactoConPlanes;