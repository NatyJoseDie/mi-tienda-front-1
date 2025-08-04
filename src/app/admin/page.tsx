"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Productos", path: "/admin/productos" },
  { name: "Listas de Precios", path: "/admin/listas-precios" },
  { name: "Catálogo Visual", path: "/admin/catalogo-visual" },
  { name: "Pedidos", path: "/admin/pedidos" },
  { name: "Compras", path: "/admin/compras" },
  { name: "Ventas Manuales", path: "/admin/ventas-manuales" },
  { name: "Ventas Minoristas", path: "/admin/ventas-minoristas" },
  { name: "Ventas Mayoristas", path: "/admin/ventas-mayoristas" },
  { name: "Revendedores", path: "/admin/revendedores" },
];

export default function AdminPanel() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-8 text-blue-700">Panel Admin</h2>
        <nav className="flex flex-col gap-2">
          {sections.map((section) => (
            <Link
              key={section.name}
              href={section.path}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pathname === section.path
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {section.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* El contenido real de cada sección se muestra en su propia ruta */}
      </main>
    </div>
  );
}
