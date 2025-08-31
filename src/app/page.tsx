import Link from 'next/link';
import Image from 'next/image';
import CategoryCard from '@/components/home/CategoryCard';
import { FiMonitor, FiHeadphones, FiShoppingCart, FiLayers, FiCoffee, FiCpu } from 'react-icons/fi';

const categories = [
  {
    icon: FiMonitor,
    title: 'Tecnología',
    description: 'Los dispositivos más innovadores del mercado.',
    className: 'bg-blue-100 text-blue-800',
  },
  {
    icon: FiHeadphones,
    title: 'Audio Premium',
    description: 'Sonido de alta calidad para verdaderos amantes.',
    className: 'bg-purple-100 text-purple-800',
  },
  {
    icon: FiShoppingCart,
    title: 'Cocina & Hogar',
    description: 'Accesorios que transforman tu espacio.',
    className: 'bg-orange-100 text-orange-800',
  },
  {
    icon: FiLayers,
    title: 'Textiles Premium',
    description: 'Sábanas y textiles de lujo importados.',
    className: 'bg-green-100 text-green-800',
  },
  {
    icon: FiCoffee,
    title: 'Mates Artesanales',
    description: 'Tradición argentina con diseño moderno.',
    className: 'bg-yellow-100 text-yellow-800',
  },
  {
    icon: FiCpu,
    title: 'Electrodomésticos',
    description: 'Freidoras y más para tu cocina inteligente.',
    className: 'bg-indigo-100 text-indigo-800',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[85vh] flex items-center justify-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1511289081-d06dda19034d?q=80&w=2070&auto=format&fit=crop"
          alt="Fondo de tecnología"
          layout="fill"
          objectFit="cover"
          className="-z-10 brightness-50"
        />
        <div className="text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            Comercia
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 mb-8">
            Descubre un mundo de productos importados premium.
            <br />
            Tecnología, hogar, audio y mucho más.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="#categorias"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Explorar Categorías
            </Link>
            <Link
              href="#conocemas"
              className="px-8 py-3 border border-white rounded-full font-medium hover:bg-white hover:text-black transition-colors"
            >
              Conocé Más
            </Link>
          </div>
        </div>
      </section>

      {/* Opciones de Compra Section */}
      <section id="opciones-compra" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Opciones de Compra</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Elige la modalidad que mejor se adapte a tus necesidades.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Minorista */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Compra Minorista</h3>
              <p className="text-gray-600 mb-6">
                Accede a nuestro catálogo completo de productos premium sin mínimo de compra. Ideal para tus proyectos personales y regalos.
              </p>
              <Link href="/productos" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Explorar catálogo &rarr;
              </Link>
            </div>
            {/* Card Revendedor */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">¿Quieres ser Revendedor?</h3>
              <p className="opacity-90 mb-6">
                Obtén precios exclusivos, soporte personalizado y sé parte de nuestra red de distribuidores.
              </p>
              <Link href="/registro-revendedor" className="font-bold bg-white text-purple-600 px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tu Propia Tienda Section */}
      <section id="tu-tienda" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 text-white p-12 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold mb-4">Potencia tu Negocio con tu Propia Tienda Online</h2>
              <p className="text-lg text-gray-300 mb-6">
                ¿Eres emprendedor? Te ofrecemos la misma tecnología que ves aquí para que puedas mostrar tus productos, gestionar tus ventas y tener el control total de tu negocio. Sin comisiones por venta.
              </p>
              <Link href="/paquetes" className="font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
                Ver Planes y Precios
              </Link>
            </div>
            <div className="flex-shrink-0">
              {/* Placeholder para una imagen o ilustración futura */}
              <div className="w-64 h-64 bg-gray-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias Section */}
      <section id="categorias" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Nuestras Categorías</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Cada producto seleccionado cuidadosamente para ofrecerte la mejor calidad y diseño.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                icon={category.icon}
                title={category.title}
                description={category.description}
                className={category.className}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter/Contact Section */}
      <section id="conocemas" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900">¿Listo para Descubrir Más?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Próximamente lanzamos nuestra tienda online. Mantente informado sobre nuestros productos únicos.
          </p>

          <div className="mt-12 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Mantente Conectado</h3>
            <p className="text-gray-600 mb-6">Sé el primero en conocer nuestros nuevos productos y ofertas exclusivas.</p>
            <div className="space-y-4">
              <Link
                href="#"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Suscribirse al Newsletter
              </Link>
              <Link
                href="#"
                className="block w-full text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Contactar por WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
