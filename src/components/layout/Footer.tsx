import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand and Socials */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold mb-4 block">
              FerreArt
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Productos importados premium para tu vida.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"><FaFacebook size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"><FaInstagram size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"><FaTwitter size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"><FaWhatsapp size={20} /></Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navegación</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/productos" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Productos</Link></li>
              <li><Link href="/registro-revendedor" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Revendedores</Link></li>
              <li><Link href="/contacto" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Contacto</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Soporte</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Políticas de Devolución</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 block py-1">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>info@ferreart.com</li>
                <li>+54 11 1234-5678</li>
              </ul>
            </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FerreArt. Todos los derechos reservados.</p>
          <p className="mt-2 text-xs text-gray-600">Powered by Comercia</p>
        </div>
      </div>
    </footer>
  );
}
