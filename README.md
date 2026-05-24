# Frontend — Bazar Pisaflores

Directorio digital para negocios locales. Construido con Next.js 16, React 19, Tailwind CSS v4 y TanStack Query. Desplegado en AWS Amplify.

---

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.6 | Framework — App Router, SSR, Server Actions |
| React | 19.2.6 | UI |
| TypeScript | ^5 | Lenguaje |
| Tailwind CSS | ^4 | Estilos (PostCSS plugin) |
| TanStack Query | ^5.95.2 | Caché y estado del servidor |
| React Hook Form | ^7.72.0 | Estado de formularios |
| Zod | ^4.3.6 | Validación de esquemas |
| shadcn/ui | ^4.1.1 | Componentes base (Radix UI) |
| Embla Carousel | ^8.6.0 | Carrusel de imágenes de productos |
| Sonner | ^2.0.7 | Notificaciones toast |
| next-themes | ^0.4.6 | Modo oscuro/claro |
| date-fns | ^4.1.0 | Formateo de fechas |
| input-otp | ^1.4.2 | Input OTP para verificación de email |
| react-day-picker | ^9.14.0 | Selector de fechas en ofertas |
| lucide-react | ^1.7.0 | Iconos |
| clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Merge de clases (`cn()`) |
| tw-animate-css | ^1.4.0 | Animaciones CSS |

---

## Variables de entorno

Crea `frontend/.env.local`:

```env
# API Backend (AWS Lambda + API Gateway)
NEXT_PUBLIC_API_URL=https://sun4e6qwxk.execute-api.mx-central-1.amazonaws.com/prod

# CDN para imágenes procesadas (CloudFront)
NEXT_PUBLIC_CLOUDFRONT_URL=https://dfhxz8b92ecn8.cloudfront.net

# Modo mock — true usa datos en memoria, false usa la API real
NEXT_PUBLIC_USE_MOCK=false
```

> Con `NEXT_PUBLIC_USE_MOCK=true` la app funciona completamente sin backend. Útil para desarrollo de UI.

---

## Desarrollo local

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint    # ESLint
```

---

## Estructura del proyecto

```
frontend/src/
├── app/                              # App Router — páginas y layouts
│   ├── layout.tsx                    # Root layout: ThemeProvider, QueryProvider, Navbar, Toaster
│   ├── page.tsx                      # Home — hero, negocios populares, categorías, ofertas
│   ├── globals.css                   # Variables CSS (tema verde/azul), animaciones, Tailwind v4
│   ├── auth/
│   │   ├── login/page.tsx            # Login con email y contraseña
│   │   ├── register/page.tsx         # Registro de nueva cuenta
│   │   ├── confirm/page.tsx          # Verificación de email (código OTP 6 dígitos)
│   │   └── forgot-password/page.tsx  # Recuperación de contraseña (2 pasos: solicitud + reset)
│   ├── businesses/
│   │   ├── loading.tsx               # Skeleton loader del directorio
│   │   ├── page.tsx                  # Directorio público con filtros por categoría y búsqueda
│   │   └── [id]/page.tsx             # Perfil público: galería, horarios, catálogo, ofertas
│   ├── dashboard/
│   │   ├── layout.tsx                # Layout del panel: sidebar + área principal
│   │   ├── page.tsx                  # Panel principal del owner (lista negocios o CTA)
│   │   ├── businesses/
│   │   │   ├── new/page.tsx          # Crear nuevo negocio
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Panel del negocio: inventario y acciones rápidas
│   │   │       ├── settings/page.tsx # Editar info del negocio + galería de imágenes + horarios
│   │   │       ├── products/
│   │   │       │   ├── page.tsx      # Inventario completo de productos
│   │   │       │   └── [productId]/page.tsx  # Editar producto + gestión de imágenes
│   │   │       └── offers/
│   │   │           ├── page.tsx      # Listado de ofertas relámpago
│   │   │           └── new/page.tsx  # Crear oferta relámpago
│   │   └── products/
│   │       └── new/page.tsx          # Crear producto (recibe businessId por query param)
│   ├── flash-offers/page.tsx         # Página pública de ofertas activas con filtro por categoría
│   └── search/
│       ├── loading.tsx               # Skeleton loader de búsqueda
│       └── page.tsx                  # Búsqueda global de negocios
├── actions/                          # Server Actions (Next.js "use server")
│   ├── auth.ts                       # Autenticación: login, register, confirm, logout, session
│   └── mutations.ts                  # Mutaciones: negocios, productos, imágenes, ofertas
├── components/
│   ├── ui/                           # Componentes base (shadcn/ui)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx              # Embla Carousel wrapper
│   │   ├── dialog.tsx
│   │   ├── file-upload.tsx           # Input de archivos con validación
│   │   ├── input.tsx
│   │   ├── input-otp.tsx             # Input OTP de 6 dígitos
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx                # Configuración del Toaster
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── dashboard/                    # Componentes del panel de owner
│   │   ├── active-business-button.tsx    # Botón para reactivar negocio pausado
│   │   ├── back-button.tsx               # Botón de retroceso
│   │   ├── business-dashboard-card.tsx   # Card de negocio con acciones rápidas
│   │   ├── business-settings-form.tsx    # Formulario de edición de negocio
│   │   ├── calendar-widget.tsx           # Widget de calendario para horarios
│   │   ├── delete-business-button.tsx    # Eliminar negocio con confirmación
│   │   ├── delete-image-button.tsx       # Eliminar imagen de galería
│   │   ├── delete-offer-button.tsx       # Eliminar oferta relámpago
│   │   ├── delete-product-button.tsx     # Eliminar producto
│   │   ├── flash-offer-card.tsx          # Card de oferta (descuento + tiempo restante)
│   │   ├── image-uploader.tsx            # Subida de imágenes con preview
│   │   ├── media-manager.tsx             # Gestor de galería (cover, delete)
│   │   ├── new-business-form.tsx         # Formulario de creación de negocio
│   │   ├── pause-business-button.tsx     # Pausar negocio (inicia periodo de gracia)
│   │   └── product-edit-form.tsx         # Formulario de edición de producto
│   ├── navbar.tsx                    # Barra de navegación sticky con búsqueda y auth
│   ├── become-owner-cta.tsx          # CTA para visitantes sin negocio
│   ├── business-card.tsx             # Card reutilizable de negocio (listados)
│   ├── dashboard-client-content.tsx  # Contenido del dashboard con estado y toasts
│   ├── pagination-bar.tsx            # Paginación con ellipsis inteligente
│   ├── query-provider.tsx            # TanStack Query Provider
│   ├── search-filters.tsx            # CategoryFilter y SearchBar reutilizables
│   ├── session-watcher.tsx           # Detecta expiración de sesión en cliente
│   └── theme-provider.tsx            # next-themes Provider
├── hooks/
│   └── use-data.hook.ts              # Hooks de TanStack Query para datos del servidor
├── lib/
│   ├── api.ts                        # Facade de API (fetch + normalizers + mock)
│   ├── utils.ts                      # cn(), getImageUrl(), getBusinessImageUrl()
│   ├── validations.ts                # Schemas Zod para todos los formularios
│   ├── toast.ts                      # Helpers de notificaciones (appToast)
│   └── get-query-client.ts           # Singleton de QueryClient para SSR
├── types/
│   └── index.ts                      # Tipos TypeScript: Business, Product, User, etc.
└── middleware.ts                     # Protección de rutas /dashboard + RBAC
```

---

## Tema y estilos

El tema usa variables CSS con Tailwind v4. Fuente principal: **Space Grotesk** (sans), PT Serif (serif), Space Mono (mono).

**Modo claro:** fondo `#f3faff`, primario verde `#00a33d`, acento `#28bc5e`
**Modo oscuro:** fondo `#02080e`, primario `#2fbc5b`, acento `#32c364`

Animaciones personalizadas disponibles como clases utilitarias:
- `.animate-fade-in` — opacidad 0→1 en 0.5s
- `.animate-slide-up` — traslación Y + opacidad en 0.5s

---

## Autenticación

### Flujo

```
1. POST /auth/register   → Cognito crea usuario, envía código al email
2. POST /auth/confirm    → Verifica código OTP de 6 dígitos
3. POST /auth/login      → Obtiene idToken + datos del usuario
4. setCookies()          → Guarda tokens en cookies
5. middleware.ts         → Protege /dashboard verificando cookies
```

### Cookies

| Cookie | httpOnly | Contenido |
|---|---|---|
| `auth_token` | ✓ | idToken de Cognito (para Server Actions y Server Components) |
| `auth_token_client` | ✗ | idToken de Cognito (para `apiFetch` en Client Components) |
| `user_role` | ✗ | `visitor` / `owner` / `admin` |
| `user_data` | ✓ | JSON del objeto User |

> Se necesitan dos cookies del token porque `httpOnly: true` impide que JavaScript del browser lo lea. `auth_token_client` es la copia legible por el cliente para que `apiFetch` pueda enviar el `Authorization` header desde hooks y componentes cliente.

### Middleware (RBAC)

El middleware aplica solo a `/dashboard/:path*` y `/auth/:path*`:

- Usuarios autenticados que visitan `/auth/*` → redirige a `/`
- `/dashboard/*` sin token válido → redirige a `/auth/login?expired=1` y limpia cookies
- Rol `visitor` intentando acceder a sub-rutas del dashboard → redirige a `/dashboard`

El middleware decodifica el JWT localmente (sin llamar al backend) para verificar expiración.

---

## Capa de API (`lib/api.ts`)

### Modo Mock vs Real

```typescript
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
// true  → datos en memoria (sin backend)
// false → API real en AWS Lambda
```

### `apiFetch` — función central

Funciona en ambos contextos:
- **Server Components / Server Actions**: lee el token de `next/headers` (cookie `auth_token` httpOnly)
- **Client Components / hooks**: lee el token de `document.cookie` (`auth_token_client`)

Si el token está expirado, limpia las cookies y lanza error. Si el backend responde `401`, también limpia la sesión.

### Normalizers

El backend devuelve mezcla de `camelCase` (relaciones) y `snake_case` (columnas DB). Los normalizers convierten todo a `snake_case` para los tipos del frontend:

```
normalizeSchedule()      → Schedule
normalizeCategory()      → Category
normalizeBusinessImage() → BusinessImage
normalizeProductImage()  → ProductImage
normalizeProduct()       → Product
normalizeFlashOffer()    → FlashOffer
normalizeBusiness()      → Business
```

Patrón: `raw.camelCase ?? raw.snake_case ?? defaultValue`.

### Funciones disponibles

**Lectura pública:**
```typescript
getCategories()
getBusinesses(opts?)                          // filtros: category_id, query + paginación
getBusinessById(id)                           // incluye images, schedules, flashOffers
getProductsByBusinessId(businessId, opts?)    // paginación: limit (default 5), offset
getBusinessProductById(businessId, productId) // producto con images[]
getFlashOffers(opts?)                         // filtros: categoryId + paginación (default limit 30)
getBusinessOffers(businessId)
getProducts(query)                            // búsqueda global GET /products/all
getOwnerBusinesses()                          // requiere token — negocios del owner
getOwnerBusinessesById(id)                    // requiere token — negocio propio por ID
```

**Mutaciones de negocio:**
```typescript
createBusiness(data)
updateBusiness(id, data)
pauseBusiness(businessId)    // inicia periodo de gracia 30 días
activeBusiness(businessId)   // cancela periodo de gracia y reactiva
deleteBusiness(businessId)   // eliminación definitiva
updateBusinessSchedules(businessId, schedules)
```

**Mutaciones de producto:**
```typescript
createBusinessProduct(businessId, data)
updateBusinessProduct(businessId, productId, data)
deleteBusinessProduct(businessId, productId)
```

**Mutaciones de oferta:**
```typescript
createFlashOffer(businessId, data)
deleteFlashOffer(businessId, offerId)
```

**Imágenes:**
```typescript
getPresignedUrl(entityType, entityId, mimeType)
uploadFileToS3(url, file)                          // PUT directo a S3, sin Authorization
confirmUpload(entityType, entityId, s3Key, isCover?)
deleteImage(imageId, entityType)
setCoverImage(imageId, entityType)
```

**Utilidades exportadas:**
```typescript
isTokenExpired(token)   // verifica expiración de JWT
clearAuthSession()      // limpia cookies de auth en el cliente
```

---

## Hooks (`hooks/use-data.hook.ts`)

```typescript
useCategories()          // staleTime: Infinity, no refetch on focus
useBusinesses(filters?)  // staleTime: 5 min — filtros: category_id, query
useMyBusinesses()        // staleTime: 5 min — negocios del owner autenticado
useBusiness(id)          // staleTime: 10 min — con initialData desde my-business-list
useFlashOffers(categoryId?) // staleTime: 1 min, refetch on focus
```

---

## Validaciones (`lib/validations.ts`)

| Schema | Uso | Campos clave |
|---|---|---|
| `LoginSchema` | Formulario de login | email, password |
| `UserRegistrationSchema` | Registro con confirmación | email, password (8+), confirmPassword |
| `ConfirmCodeSchema` | Verificación de email | email, code (6 dígitos numéricos) |
| `ForgotPasswordSchema` | Recuperación de contraseña | email |
| `ResetPasswordSchema` | Nueva contraseña con código | email, code (6 dígitos), newPassword (8+) |
| `BusinessRegistrationSchema` | Crear/editar negocio | name (3+), category_id, phone?, address?, google_maps_url? |
| `ProductRegistrationSchema` | Crear/editar producto | name (2+), price (>0), is_available |
| `FlashOfferRegistrationSchema` | Crear oferta relámpago | title (5+), discount_pct (1-100), starts_at, expires_at |
| `ScheduleDaySchema` | Un día de horario | day_of_week (0-6), opens_at?, closes_at?, is_closed |
| `SchedulesSchema` | Array de horarios | schedules: ScheduleDaySchema[] |

Todos los schemas exportan también su tipo inferido: `LoginFormValues`, `BusinessRegistrationFormValues`, etc.

---

## Imágenes

### Construir URL de CloudFront

```typescript
import { getImageUrl } from "@/lib/utils";

getImageUrl(s3Key, "sm")  // 200px WebP
getImageUrl(s3Key, "md")  // 400px WebP (default)
getImageUrl(s3Key, "lg")  // 800px WebP
// Si s3Key es null/undefined o CDN no está configurado → "/placeholder.jpg"
```

### Flujo interno de subida

```
1. POST /upload/presigned-url  → url firmada + key
2. PUT {url}                   → binario directo a S3 (sin Authorization header)
3. POST /upload/confirm        → registra en DB
4. Lambda image-processor      → genera sm/md/lg WebP (asíncrono ~2s)
```

---

## Server Actions (`actions/`)

### `auth.ts`

```typescript
registerAction(email, password)          // POST /auth/register
confirmEmailAction(email, code)          // POST /auth/confirm
resendCodeAction(email)                  // POST /auth/resend-code
loginAction(email, password)             // POST /auth/login → setCookies → redirect /dashboard
forgotPasswordAction(email)              // POST /auth/forgot-password
resetPasswordAction(email, code, newPassword) // POST /auth/reset-password
upgradeRoleAction()                      // POST /auth/become-owner → actualiza cookie user_role
logoutAction()                           // limpia las 4 cookies → redirect /
getAuthSession()                         // lee cookies → { isLoggedIn, role, user }
```

### `mutations.ts`

**Negocios:**
```typescript
createBusinessAction(data)               // → redirect /dashboard?status=created
updateBusinessAction(id, data)           // revalidatePath
updateSchedulesAction(businessId, data)  // revalidatePath
pauseBusinessAction(businessId)          // → redirect /dashboard?status=paused
activeBusinessAction(businessId)         // → redirect /dashboard?status=active
deleteBusinessAction(businessId)         // → redirect /dashboard?status=deleted
```

**Productos:**
```typescript
createProductAction(businessId, data)              // → redirect /dashboard/businesses/:id?status=product_added
updateProductAction(businessId, productId, data)   // revalidatePath
deleteProductAction(businessId, productId)         // → redirect /dashboard/businesses/:id?status=product_deleted
```

**Imágenes:**
```typescript
getPresignedUrlAction(entityType, entityId, mimeType)
confirmUploadAction(businessId, productId?, entityType, s3Key, isCover?)
deleteImageAction(businessId, productId?, imageId, entityType)
setCoverImageAction(businessId, productId?, imageId, entityType)
```

**Ofertas:**
```typescript
createFlashOfferAction(businessId, data)  // → redirect /dashboard/businesses/:id/offers?status=offer_created
deleteFlashOfferAction(businessId, offerId)
```

Todas las acciones de mutación llaman a `revalidatePath()` en las rutas afectadas para invalidar el caché de Next.js.

---

## Tipos (`types/index.ts`)

```typescript
type Role = 'admin' | 'owner' | 'visitor'
type ImageSize = 'sm' | 'md' | 'lg'

interface User {
  id: string;
  cognito_sub?: string;
  email: string;
  emailVerified: boolean;
  role: Role;
  createdAt: string;
}

interface Category { id, name, created_by?, created_at }

interface Business {
  id, owner_id, category_id?, name, description?, phone?,
  address?, maps_url?, latitude?, longitude?,
  is_active, created_at, updated_at,
  // Relaciones opcionales (presentes según el endpoint)
  coverImage?, category?, images?, schedules?, products?, flash_offers?
}

interface Image { id, s3_key, size: ImageSize, is_cover, created_at }
interface BusinessImage extends Image { business_id }
interface ProductImage extends Image { product_id }

interface Product {
  id, business_id, name, description?, price, is_available,
  created_at, updated_at, images?
}

interface Schedule {
  id, business_id, day_of_week (0-6), opens_at, closes_at, is_closed
}

interface FlashOffer {
  id, business_id, title, description?, discount_pct?,
  starts_at, expires_at, is_active, created_at, business?
}
```

---

## Páginas principales

### Públicas

| Ruta | Descripción |
|---|---|
| `/` | Home con hero, negocios populares, categorías y ofertas activas |
| `/businesses` | Directorio con filtro por categoría, búsqueda y skeleton loader |
| `/businesses/:id` | Perfil del negocio: info, horarios, catálogo con carrusel de imágenes |
| `/flash-offers` | Todas las ofertas activas con filtro por categoría |
| `/search` | Búsqueda global de negocios con skeleton loader |

### Auth

| Ruta | Descripción |
|---|---|
| `/auth/login` | Login — redirige a `/` si ya está autenticado |
| `/auth/register` | Registro |
| `/auth/confirm` | Verificación de email con input OTP |
| `/auth/forgot-password` | Recuperación de contraseña (2 pasos en la misma página) |

### Dashboard (requiere auth)

| Ruta | Rol mínimo | Descripción |
|---|---|---|
| `/dashboard` | visitor | Panel principal — muestra CTA si es visitor |
| `/dashboard/businesses/new` | owner | Crear negocio |
| `/dashboard/businesses/:id` | owner | Panel del negocio: inventario y acciones |
| `/dashboard/businesses/:id/settings` | owner | Editar info + galería de imágenes + horarios |
| `/dashboard/businesses/:id/products` | owner | Inventario completo |
| `/dashboard/businesses/:id/products/:productId` | owner | Editar producto + gestión de imágenes |
| `/dashboard/businesses/:id/offers` | owner | Gestionar ofertas relámpago |
| `/dashboard/businesses/:id/offers/new` | owner | Crear oferta |
| `/dashboard/products/new?businessId=` | owner | Crear producto |

---

## Componentes destacados

### `MediaManager` (`components/dashboard/media-manager.tsx`)
Gestor completo de galería de imágenes para negocios y productos. Permite subir nuevas imágenes, establecer cover y eliminar. Usa `image-uploader.tsx` internamente y llama a las Server Actions de imagen.

### `ImageUploader` (`components/dashboard/image-uploader.tsx`)
Componente cliente para subir imágenes. Valida tipo (JPG/PNG/WebP) y tamaño. Muestra preview local inmediato mientras sube. Ejecuta el flujo de 3 pasos: presigned URL → PUT S3 → confirm.

### `Carousel` (Embla)
Usado en el modal de producto en `/businesses/:id`. Muestra todas las imágenes del producto con navegación prev/next.

### `SessionWatcher` (`components/session-watcher.tsx`)
Componente cliente que verifica periódicamente si el token expiró y redirige al login automáticamente.

### `PaginationBar` (`components/pagination-bar.tsx`)
Paginación reutilizable con ellipsis inteligente. Usada en el directorio de negocios y listados del dashboard.

### `SearchFilters` (`components/search-filters.tsx`)
Exporta `CategoryFilter` y `SearchBar` como componentes independientes y reutilizables.

### `QueryProvider` (`components/query-provider.tsx`)
Envuelve la app con `QueryClientProvider` de TanStack Query. Usa `getQueryClient()` para el singleton SSR-compatible.

---

## Reglas de negocio en el frontend

| Regla | Dónde se aplica |
|---|---|
| Máx 30 productos — botón deshabilitado con tooltip | `/dashboard/businesses/:id/page.tsx` |
| Solo owners pueden acceder al dashboard (sub-rutas) | `middleware.ts` |
| Visitors redirigidos a `/dashboard` (CTA become-owner) | `middleware.ts` |
| Token expirado → logout automático | `apiFetch` + `SessionWatcher` |
| Imágenes: solo JPG/PNG/WebP | `FileUpload` + `ImageUploader` |
| Negocio pausado requiere periodo de gracia antes de eliminar | `DeleteBusinessButton` |

---

## Notas de desarrollo

- El carrusel en el modal de producto requiere `getBusinessProductById` para obtener `images[]`. `getProductsByBusinessId` solo devuelve `coverImage` como string plano.
- `NEXT_PUBLIC_USE_MOCK=true` es útil para desarrollar UI sin backend activo. Los datos mock están en `lib/api.ts`.
- Las redirecciones post-acción usan query params `?status=` para mostrar toasts de feedback en la página destino (ej. `?status=created`, `?status=paused`).
- `getQueryClient()` retorna un singleton en el cliente y una instancia nueva por request en el servidor (patrón recomendado para SSR con TanStack Query).
- `apiFetch` es portable: funciona en Server Components (lee `next/headers`), Server Actions y Client Components (lee `document.cookie`).
