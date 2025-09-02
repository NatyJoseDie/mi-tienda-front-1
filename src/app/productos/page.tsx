import { redirect } from 'next/navigation';

// Redirige /productos al nuevo catálogo unificado
export default function ProductosIndexRedirect() {
  redirect('/catalogo');
}