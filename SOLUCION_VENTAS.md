# Solución para Problemas de Ventas

## Problema Identificado

El sistema de ventas no funciona porque **el backend no está ejecutándose**. Este proyecto frontend necesita un servidor backend separado corriendo en el puerto 3000.

## Errores que estás viendo:

- `net::ERR_CONNECTION_REFUSED http://localhost:3000/ventas/minoristas`
- `net::ERR_CONNECTION_REFUSED http://localhost:3000/productos?conGanancia=true`
- `HTTP 401` en `/compras`
- No se puede presionar el botón "Registrar Ventas"

## ¿Por qué no puedo registrar ventas?

1. **Backend no ejecutándose**: El frontend intenta conectarse a `http://localhost:3000` pero no hay ningún servidor corriendo ahí.
2. **Sin productos**: Sin backend, no se pueden cargar los productos necesarios para las ventas.
3. **Sin base de datos**: Las ventas necesitan guardarse en una base de datos que maneja el backend.
4. **Error 401**: Indica problemas de autenticación con el backend (también causado por backend no disponible).

## Solución

### Paso 1: Verificar si tienes el proyecto backend

Busca en tu computadora un proyecto que contenga:
- Archivos `.ts` con decoradores `@Controller`, `@Get`, `@Post`
- Un archivo `main.ts` o similar
- Carpetas como `src/controllers`, `src/services`
- Un `package.json` con dependencias de NestJS o Express

### Paso 2: Ejecutar el backend

Si encuentras el proyecto backend:

```bash
# Navega al directorio del backend
cd ruta/al/proyecto/backend

# Instala dependencias (si es necesario)
npm install

# Ejecuta el servidor
npm run start:dev
# o
npm run dev
# o
npm start
```

El backend debe ejecutarse en el puerto 3000.

### Paso 3: Verificar la conexión

Una vez que el backend esté corriendo:
1. Ve a `http://localhost:3000` en tu navegador
2. Deberías ver una respuesta del servidor (puede ser un mensaje de API o documentación)
3. Regresa al frontend en `http://localhost:3001/admin/ventas-minoristas`
4. Los productos deberían cargarse automáticamente

## Cómo usar el sistema de ventas (una vez que el backend funcione)

### Registro de Ventas Minoristas

1. **Ir a la página**: `/admin/ventas-minoristas`
2. **Seleccionar producto**: Elige un producto del dropdown
3. **Configurar cantidad y precio**: Ajusta según la venta
4. **Agregar al carrito**: Haz clic en "Agregar al Carrito" 🛒
5. **Repetir**: Puedes agregar múltiples productos
6. **Completar datos del comprador**: Nombre obligatorio
7. **Registrar venta**: Haz clic en "Registrar Venta"

### Ver Ventas Registradas

1. En la misma página, haz clic en "Ver Ventas"
2. Verás el historial de todas las ventas
3. Puedes exportar a Excel si necesitas

## Tipos de Ventas Disponibles

- **Ventas Minoristas** (`/admin/ventas-minoristas`): Para consumidores finales
- **Ventas Mayoristas** (`/admin/ventas-mayoristas`): Para distribuidores
- **Ventas Manuales** (`/admin/ventas-manuales`): Para ventas especiales

## Solución Temporal (Modo Desarrollo)

Si no puedes encontrar o ejecutar el backend inmediatamente, puedes:

1. **Crear datos mock temporales** modificando el código frontend
2. **Deshabilitar las llamadas al backend** temporalmente
3. **Usar localStorage** para simular el carrito

### Modificación temporal para testing:

Puedes comentar temporalmente las llamadas al backend en:
- `src/app/admin/ventas-minoristas/page.tsx` (líneas 31 y 54)
- `src/app/admin/compras/page.tsx` (línea 48)

## Si no tienes el proyecto backend

Si no encuentras el proyecto backend, necesitarás:
1. Obtener el código del backend del desarrollador
2. O crear un nuevo backend compatible
3. O implementar la solución temporal arriba

## Verificación Rápida

Para verificar si el backend está funcionando:

```bash
# En una terminal, ejecuta:
curl http://localhost:3000
# o
curl http://localhost:3000/productos
```

Si obtienes una respuesta, el backend está funcionando.

---

**Nota**: Este frontend está diseñado para trabajar con un backend específico. Sin él, las funcionalidades de ventas, productos y base de datos no funcionarán.