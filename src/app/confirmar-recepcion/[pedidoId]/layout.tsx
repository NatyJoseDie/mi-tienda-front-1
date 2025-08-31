// Función requerida para exportación estática
export async function generateStaticParams() {
  // Retornamos un array vacío ya que los pedidos son dinámicos
  // La página se generará bajo demanda
  return [];
}

export default function ConfirmarRecepcionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}