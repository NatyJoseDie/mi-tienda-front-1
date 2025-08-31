// Datos mock para desarrollo sin backend
export const mockProductos = [
  {
    id: 1,
    nombre: "Producto Demo 1",
    descripcion: "Producto de demostración",
    precio: 100,
    precioVenta: 150,
    stock: 50,
    categoria: "Electrónicos",
    ganancia: 50,
    porcentajeGanancia: 50
  },
  {
    id: 2,
    nombre: "Producto Demo 2",
    descripcion: "Segundo producto de demostración",
    precio: 200,
    precioVenta: 280,
    stock: 30,
    categoria: "Hogar",
    ganancia: 80,
    porcentajeGanancia: 40
  },
  {
    id: 3,
    nombre: "Producto Demo 3",
    descripcion: "Tercer producto de demostración",
    precio: 50,
    precioVenta: 75,
    stock: 100,
    categoria: "Accesorios",
    ganancia: 25,
    porcentajeGanancia: 50
  }
];

export const mockVentas = [
  {
    id: 1,
    fecha: "2024-01-15",
    comprador: "Cliente Demo",
    metodoPago: "Efectivo",
    productos: [
      {
        id: 1,
        nombre: "Producto Demo 1",
        cantidad: 2,
        precioUnitario: 150,
        subtotal: 300
      }
    ],
    total: 300,
    gananciaTotal: 100,
    notas: "Venta de demostración",
    facturaEmitida: true
  }
];

// Funciones para simular API calls
export const mockAPI = {
  // Simular carga de productos
  async getProductos() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProductos);
      }, 500); // Simular delay de red
    });
  },

  // Simular carga de ventas
  async getVentas() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (typeof window === 'undefined') {
          resolve(mockVentas); // Server-side
          return;
        }
        
        const ventasGuardadas = localStorage.getItem('mock_ventas');
        if (ventasGuardadas) {
          resolve(JSON.parse(ventasGuardadas));
        } else {
          localStorage.setItem('mock_ventas', JSON.stringify(mockVentas));
          resolve(mockVentas);
        }
      }, 500);
    });
  },

  // Simular registro de venta
  async registrarVenta(ventaData: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaVenta = {
          ...ventaData,
          id: Date.now(), // ID simple basado en timestamp
          fecha: new Date().toISOString().split('T')[0]
        };
        
        if (typeof window === 'undefined') {
          resolve(nuevaVenta); // Server-side
          return;
        }
        
        const ventasActuales = JSON.parse(localStorage.getItem('mock_ventas') || '[]');
        ventasActuales.push(nuevaVenta);
        localStorage.setItem('mock_ventas', JSON.stringify(ventasActuales));
        resolve(nuevaVenta);
      }, 800);
    });
  }
};

// Función para verificar si estamos en modo mock
export const isMockMode = () => {
  if (typeof window === 'undefined') return false; // Server-side
  return localStorage.getItem('mock_mode') === 'true';
};

// Función para activar/desactivar modo mock
export const setMockMode = (enabled: boolean) => {
  if (typeof window === 'undefined') return; // Server-side
  localStorage.setItem('mock_mode', enabled.toString());
};