// Función requerida para exportación estática
export async function generateStaticParams() {
  // Retornamos un array vacío ya que los productos son dinámicos
  // La página se generará bajo demanda
  return [];
}

export default function ProductoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}