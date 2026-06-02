# Roadmap de Próximas Implementaciones — Bazar Pisaflores

Este documento establece la planeación, clasificación y diseño técnico de las nuevas características para la plataforma **Bazar Pisaflores**, estructuradas a partir del análisis del comportamiento real de los usuarios en la comunidad (logs de WhatsApp de 6 meses) y los requerimientos tácticos de optimización y experiencia de usuario (UX/UI).

---

## Matriz Global de Características por Prioridad

| Característica / Módulo | Prioridad | Capa Impactada | Complejidad | Dolor que Resuelve |
| :--- | :---: | :--- | :---: | :--- |
| Cambio de Tonalidad (Verde → Rosado) | 🔴 Inmediata | Frontend (Estilos) | Baja | Identidad de marca propia fuera de WhatsApp |
| Botón "Ir Atrás" en Perfil de Negocio | 🔴 Inmediata | Frontend (UX) | Baja | Pérdida de contexto al navegar por perfiles |
| Mensajes Predeterminados de Venta | 🔴 Inmediata | Frontend (Integración) | Baja | Agiliza el cierre de venta directo en WhatsApp |
| Íconos Dinámicos en Categorías | 🟡 Alta | Fullstack (DB + UI) | Baja-Media | Falta de distinción visual entre rubros comerciales |
| Buscador Interno en Perfil de Negocio | 🟡 Alta | Fullstack (Filtros) | Baja-Media | Evita scroll masivo en catálogos de más de 10 productos |
| Optimización de Fetch (Paginación 10/10) | 🟡 Alta | Fullstack (Perf) | Media | Sobrecarga de memoria en Lambda y renderizado cliente |
| Página Global de Productos (Fair Exposure) | 🟡 Alta | Fullstack (Core) | Media-Alta | Monopolio visual en el feed; da exposición equitativa |
| Mapa de Negocios e Interfaz Pull-up | 🟢 Media | Fullstack (Geo) | Alta | Sustituye el constante "¿Dónde entregas?" |
| Pizarra de Intercambio de Liquidez | 🟢 Media | Módulo Nuevo (P2P) | Media | Elimina la saturación de solicitudes de efectivo/transfer |
| Tablón de Avisos Comunitarios | 🔵 Baja / Fase 2 | Módulo Nuevo (Feed) | Baja-Media | Descongestiona el grupo de reportes de vialidad/luz |
| Directorio de Servicios y Oficios | 🔵 Baja / Fase 2 | Módulo Nuevo | Media | Centraliza fontaneros, taxis y médicos (Sección Amarilla) |
| Módulo de Viajes y Encomiendas | 🔵 Baja / Fase 3 | Módulo Nuevo | Media-Alta | Organiza envíos/viajes (Pachuca, CDMX, Huejutla) |

---

## 🔴 Prioridad Inmediata — Quick Wins & Identidad Visual

### 1.1 Cambio de Tonalidad del Tema (Verde → Rosado)

**Descripción:** Modificar el Design System de la aplicación para cambiar el color acento verde por un tono rosado moderno, diferenciando la app visualmente de la UI tradicional de WhatsApp.

- **Archivo afectado:** `frontend/src/app/globals.css`
- **Cambio:** Reemplazar las variables de color primario (`#00a33d`, `#28bc5e`, etc.) por sus equivalentes en la gama del rosado/magenta desaturado profesional.

---

### 1.2 Botón "Ir Atrás" en el Directorio / Perfil de un Negocio

**Descripción:** Implementar un botón persistente de retorno en la vista pública de negocios (`/businesses/:id`) para que el usuario pueda regresar al directorio exacto o búsqueda previa sin perder sus filtros.

- **Archivo afectado:** `frontend/src/app/businesses/[id]/page.tsx`
- **Componente a reutilizar:** `back-button.tsx` ya existente en el panel de control del dashboard.

---

### 1.3 Mejora de Mensajes Predeterminados — Botón "Pedir por WhatsApp"

**Descripción:** Formatear dinámicamente el string de la API de WhatsApp para incluir de manera limpia el nombre del producto, el precio y un saludo automatizado.

- **Ejemplo del mensaje generado:**
  > *"Hola [Nombre del Negocio], vi tu producto '[Nombre Producto]' en Bazar Pisaflores con precio de $[Precio]. ¿Tiene disponibilidad?"*
- **Implementación:** Construir el texto codificado en URI directamente en el componente del perfil público.

---

## 🟡 Prioridad Alta — Experiencia de Usuario & Performance Core

### 2.1 Íconos Dinámicos en las Categorías

**Descripción:** Cada categoría del directorio mostrará un ícono intuitivo que represente su sector, cargado de forma dinámica desde el servidor.

**Cambios requeridos:**

- **Backend (DB):** Agregar columna `icon_name VARCHAR(50)` a la tabla `categories`.
- **Backend (API):** Incluir `icon_name` en la respuesta de `GET /categories`.
- **Frontend:** En `frontend/src/components/search-filters.tsx`, mapear el `icon_name` recibido de la API a un componente dinámico de `lucide-react` usando un diccionario de íconos seguros.

---

### ~~2.2 Buscador Interno de Productos dentro del Perfil de un Negocio~~ ✅ Implementado

**Descripción:** Barra de búsqueda dentro de la vista pública del negocio (`/businesses/:id`) que filtra el catálogo local en tiempo real sin recargar la página.

**Implementación:**

- Extraído a `components/business/product-catalog.tsx` como Client Component (`"use client"`) para resolver el error de hidratación SSR causado por los IDs dinámicos de Radix UI (`Dialog`, `Carousel`).
- Filtrado client-side con `useState` sobre el array de productos ya cargado — sin llamadas adicionales a la API.
- Muestra estado vacío diferenciado: `"Sin resultados para '...'"` vs `"Aún no hay productos disponibles."`
- El mensaje de WhatsApp del modal ahora incluye nombre y precio del producto.

---

### 2.3 Optimización Global de Fetch (Paginación 10 en 10)

**Descripción:** Restringir la carga de registros a un máximo de 10 elementos por página en todas las vistas públicas de listados y en el Dashboard de Owners para inventarios grandes.

**Cambios requeridos:**

- Ajustar el `limit` por defecto a `10` en las llamadas del frontend.
- Conectar el componente `PaginationBar` existente en `/dashboard/businesses/[id]/products/page.tsx`.
- Aplicar la misma lógica en las páginas públicas de negocios y productos.

---

### 2.4 Página Global de Productos — Marketplace Variado y Equitativo

**Descripción:** Nueva página pública (`/products`) que consolida el inventario completo de la plataforma en un catálogo unificado con paginación de 20 en 20.

**Estrategia de Exposición Justa (Fair Exposure):** La primera carga entrega un listado aleatorio controlado para dar visibilidad equitativa a todos los comercios, independientemente de su tamaño.

**Especificación técnica:**

- Agregar soporte en `GET /products/all` para recibir un query param `seed` opcional.
- En la query SQL de PostgreSQL, usar `setseed(seed)` + `ORDER BY random()` para mantener consistencia durante la paginación de una misma sesión.
- Añadir un botón **"Recargar / Mezclar"** en la interfaz para regenerar una nueva semilla aleatoria e invalidar el caché de TanStack Query.

---

## 🟢 Prioridad Media — Geolocalización & Módulos Transaccionales

### 3.1 Mapa de Negocios e Interfaz Pull-up

**Descripción:** Vista geográfica de la economía local. Una página `/map` renderizará un mapa interactivo con marcadores (pins) de cada negocio activo.

**Flujo — Usuario visitante:**
1. Accede a `/map` y ve los pins de todos los negocios activos.
2. Al pulsar un pin, se despliega una interfaz **pull-up** (modal inferior compacto) con imagen cover, nombre, categoría y un botón directo de "Visitar Perfil".

**Flujo — Owner:**
1. En el formulario de registro/edición del negocio, se integra el mapa para asignar coordenadas (`latitude`, `longitude`) arrastrando un marcador (draggable pin).

---

### 3.2 Pizarra de Intercambio de Efectivo / Liquidez

**Descripción:** Muro P2P optimizado para resolver la necesidad comunitaria diaria de cambiar dinero físico por saldo digital o viceversa.

**Arquitectura de base de datos:**

```sql
CREATE TABLE liquidity_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        VARCHAR(20) NOT NULL CHECK (type IN ('cash_to_transfer', 'transfer_to_cash')),
  amount      NUMERIC(10, 2) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  status      VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);
```

- **TTL estricto de 72 horas:** Las publicaciones expiran y se ocultan automáticamente para evitar datos obsoletos en `db.t3.micro`.

---

## 🔵 Prioridad Baja — Extensiones Comunitarias (Fases Posteriores)

### 4.1 Tablón de Avisos Comunitarios e Incidentes

**Descripción:** Sección de alertas críticas en tiempo real: bloqueos de vialidades, cortes eléctricos de CFE, objetos/mascotas perdidas.

- **Control de acceso:** Limitado a `admin` y perfiles con reputación verificada para mitigar noticias falsas o spam.

---

### 4.2 Directorio de Servicios y Oficios (Sección Amarilla)

**Descripción:** Segmentación en la base de datos para separar negocios con catálogo físico de prestadores de servicios independientes (herreros, electricistas, plomeros) que solo requieren una tarjeta de contacto y horarios de guardia.

---

### 4.3 Módulo de Viajes y Encomiendas (Carpooling de Carga)

**Descripción:** Módulo de coordinación logística local. Los conductores publican sus salidas programadas a ciudades vecinas, detallando cupos para pasajeros o capacidad para recolección de paquetería externa.

---

## Lineamientos de Desarrollo con Kiro

Para cada característica que se empiece a desarrollar, se seguirá el siguiente flujo:

1. **Generación del Prompt:** Estructurar los cambios necesarios detallando:
   - Backend: rutas nuevas y schemas Zod
   - Base de datos: migraciones SQL
   - Frontend: componentes shadcn/ui y hooks de TanStack Query

2. **Auditoría de Código:** Validar que el código:
   - Respete el límite de conexiones concurrentes de RDS (`max: 2`)
   - Controle errores mediante `AppError`
   - Optimice las llamadas asíncronas con `Promise.all` donde aplique

3. **Commit de Git:** Una vez verificada la ejecución, generar el mensaje de commit bajo la metodología de **Conventional Commits**.
