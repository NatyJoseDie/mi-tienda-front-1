'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CarritoPage() {
  const { cartItems, removeFromCart, clearCart, totalItems } = useCart();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + (item.precio_final || 0) * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const pedido = {
      ...formData,
      productos: cartItems.map(item => ({
        producto_id: item.id,
        nombre: item.nombre,
        cantidad: item.quantity,
        precio_unitario: item.precio_final || 0,
      })),
      total,
    };

    try {
      const response = await fetch('http://localhost:3000/usuarios/pedido-consumidor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies
        body: JSON.stringify(pedido),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Hubo un problema al registrar el pedido.');
      }

      setSuccess(true);
      clearCart();
    } catch (err: unknown) {
      // Type guard para obtener el mensaje de error
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error inesperado.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-green-600">¡Pedido realizado con éxito!</h1>
        <p className="mt-4 text-lg">Gracias por tu compra, {formData.nombre}.</p>
        <p>Hemos enviado un correo a <strong>{formData.email}</strong> con los detalles de tu pedido y el enlace de pago.</p>
        <Link href="/productos" className="mt-8 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tu Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-600">No tienes productos en tu carrito.</p>
          <Link href="/productos" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Productos ({totalItems})</h2>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center py-4">
                  <Image src={item.imagen_principal || 'https://placehold.co/100x100.png'} alt={item.nombre} width={80} height={80} className="rounded-md" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.nombre}</h3>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    <p className="text-lg font-bold text-indigo-600">${(item.precio_final || 0).toLocaleString('es-AR')}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-semibold">
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulario y Resumen */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4">Completa tus datos</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input type="text" name="nombre" placeholder="Nombre completo" required onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
                <input type="email" name="email" placeholder="Email" required onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
                <input type="tel" name="telefono" placeholder="Teléfono" required onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
                <input type="text" name="direccion" placeholder="Dirección (opcional)" onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md" />
              </div>
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400">
                  {isSubmitting ? 'Procesando...' : 'Finalizar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}