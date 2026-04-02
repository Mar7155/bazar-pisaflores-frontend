# Frontend — Bazar Pisaflores

Directorio digital para negocios locales. Construido con Next.js 16, React 19, Tailwind CSS v4 y TanStack Query.

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) | Framework — SSR, SSG, Server Actions |
| React 19 | UI |
| Tailwind CSS v4 | Estilos |
| TanStack Query v5 | Cache y estado del servidor |
| React Hook Form + Zod | Formularios y validación |
| shadcn/ui + Radix UI | Componentes base |
| Embla Carousel | Carrusel de imágenes |
| Sonner | Notificaciones toast |
| next-themes | Modo oscuro/claro |

---

## Variables de entorno

Crea `frontend/.env.local`:

```env
# API Backend (AWS Lambda + API Gateway)
NEXT_PUBLIC_API_URL=

# CDN para imágenes procesadas (CloudFront)
NEXT_PUBLIC_CLOUDFRONT_URL=

# Modo mock — true usa datos en memoria, false usa la API real
NEXT_PUBLIC_USE_MOCK=true
```

> Con `NEXT_PUBLIC_USE_MOCK=true` la app funciona completamente sin backend, útil para desarrollo de UI.

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
├── app/                          # App Router — páginas y layouts
│   ├── layout.tsx                # Root layout: ThemeProvider, QueryProvider, Navbar, Toaster
│   ├── page.tsx                  # Home — directorio público con filtros
│   ├── auth/
│   │   ├── login/page.tsx        # Login con email y contraseña
│   │   ├── register/page.tsx     # Registro de nueva cuenta
│   │   ├── confirm/page.tsx      # Verificación de email (código 6 dígitos)
│   │   └── forgot-password/page.tsx  # Recuperación de contraseña
│   ├── businesses/
│   │   ├── page.tsx              # Listado público de negocios con filtros
│   │   └── [id]/page.tsx         # Perfil público del negocio con catálogo y carrusel
│   ├── dashboard/
│   │   ├── layout.tsx            # Layout del panel: sidebar + área principal
│   │   ├── page.tsx              # Panel principal del owner
│   │   ├── businesses/
│   │   │   ├── new/page.tsx      # Crear nuevo negocio
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Panel del negocio: inventario y acciones
│   │   │       ├── settings/page.tsx   # Editar info + horarios
│   │   │       ├── products/
│   │   │       │   ├── page.tsx        # Inventario completo
│   │   │       │   └── [productId]/page.tsx  # Editar producto + gestión de imágenes
│   │   │       └── offers/
│   │   │           ├── page.tsx        # Listado de ofertas relámpago
│   │   │           └── new/page.tsx    # Crear oferta relámpago
│   │   └── products/
│   │       └── new/page.tsx      # Crear producto (recibe businessId por query param)
│   ├── flash-offers/page.tsx     # Página pública de ofertas activas
│   └── search/page.tsx           # Búsqueda global
├── actions/                      # Server Actions (Next.js "use server")
│   ├── auth.ts                   # login, register, confirm, logout, getAuthSession
│   └── mutations.ts              # createBusiness, updateBusiness, updateSchedules, etc.
├── components/
│   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx          # Embla Carousel wrapper
│   │   ├── dialog.tsx
│   │   ├── file-upload.tsx       # Subida de imágenes conectada a la API real
│   │   ├── input.tsx
│   │   ├── input-otp.tsx
│   │   ├── label.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── dashboard/                # Componentes específicos del panel
│   │   ├── product-edit-form.tsx
│   │   ├── product-media-manager.tsx
│   │   └── delete-product-button.tsx
│   ├── navbar.tsx                # Barra de navegación global
│   ├── become-owner-cta.tsx      # CTA para visitantes sin negocio
│   ├── dashboard-client-content.tsx
│   ├── query-provider.tsx        # TanStack Query Provider
│   ├── session-watcher.tsx       # Detecta expiración de sesión en cliente
│   └── theme-provider.tsx        # next-themes Provider
├── hooks/
│   └── use-data.hook.ts          # Hooks de TanStack Query para datos del servidor
├── lib/
│   ├── api.ts                    # Capa de acceso a la API (fetch + normalizers + mock)
│   ├── utils.ts                  # cn(), getImageUrl()
│   ├── validations.ts            # Schemas Zod para todos los formularios
│   ├── toast.ts                  # Helpers de notificaciones (appToast)
│   └── get-query-client.ts       # Singleton de QueryClient para SSR
├── types/
│   └── index.ts                  # Tipos TypeScript: Business, Product, User, etc.
└── middleware.ts                 # Protección de rutas /dashboard + RBAC
```

---

## Autenticación

### Flujo

```
1. POST /auth/register   → Cognito crea usuario, envía código al email
2. POST /auth/confirm    → Verifica código de 6 dígitos
3. POST /auth/login      → Obtiene idToken + datos del usuario
4. setCookies()          → Guarda tokens en cookies HttpOnly
5. middleware.ts         → Protege /dashboard verificando cookies
```

### Cookies

| Cookie | httpOnly | Contenido |
|---|---|---|
| `auth_token` | ✓ | idToken de Cognito (para Server Actions) |
| `auth_token_client` | ✗ | idToken de Cognito (para apiFetch en cliente) |
| `user_role` | ✗ | `visitor` / `owner` / `admin` |
| `user_data` | ✓ | JSON del objeto User |

> Se necesitan dos cookies del token porque `httpOnly: true` impide que JavaScript del browser lo lea. `auth_token_client` es la copia legible por el cliente para que `apiFetch` pueda enviar el `Authorization` header desde hooks y componentes cliente.

### Middleware (RBAC)

```typescript
// Solo protege /dashboard/*
// Redirige a /auth/login si no hay auth_token
// Redirige a /dashboard si el rol es 'visitor' e intenta acceder a sub-rutas
```

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
- **Server Components / Server Actions**: lee el token de `next/headers` (cookies HttpOnly)
- **Client Components / hooks**: lee el token de `document.cookie` (`auth_token_client`)

Manejo automático de sesión expirada: si el token está expirado limpia las cookies y lanza error `"401"`.

### Normalizers

El backend devuelve mezcla de `camelCase` (relaciones) y `snake_case` (columnas DB). Los normalizers convierten todo a `snake_case` para los tipos del frontend:

```
normalizeProduct()   → Product
normalizeBusiness()  → Business
normalizeSchedule()  → Schedule
normalizeFlashOffer() → FlashOffer
normalizeCategory()  → Category
```

### Funciones disponibles

**Lectura pública:**
```typescript
getCategories()
getBusinesses(opts?)                          // filtros: category_id, query
getBusinessById(id)                           // incluye images, schedules, flashOffers
getProductsByBusinessId(businessId)           // lista sin imágenes
getBusinessProductById(businessId, productId) // producto con images[]
getFlashOffers(categoryId?)
getBusinessOffers(businessId)
getProducts(query)                            // búsqueda global
getOwnerBusinesses()                          // requiere token
```

**Mutaciones:**
```typescript
createBusiness(data)
updateBusiness(id, data)
updateBusinessSchedules(businessId, schedules)
createBusinessProduct(businessId, data)
updateBusinessProduct(businessId, productId, data)
deleteBusinessProduct(businessId, productId)
createFlashOffer(businessId, data)
deleteFlashOffer(businessId, offerId)
```

**Imágenes:**
```typescript
uploadImage(entityType, entityId, file, isCover?)  // flujo completo 3 pasos
getPresignedUrl(entityType, entityId, mimeType)
uploadFileToS3(url, file)
confirmUpload(entityType, entityId, s3Key, isCover?)
deleteImage(imageId, entityType)
setCoverImage(imageId, entityType)
```

---

## Hooks (`hooks/use-data.hook.ts`)

```typescript
useCategories()          // staleTime: Infinity, no refetch on focus
useBusinesses(filters?)  // staleTime: 5 min
useMyBusinesses()        // staleTime: 5 min — negocios del owner autenticado
useBusiness(id)          // staleTime: 10 min — con initialData desde my-business-list
useFlashOffers(categoryId?) // staleTime: 1 min, refetch on focus
```

---

## Validaciones (`lib/validations.ts`)

| Schema | Uso |
|---|---|
| `LoginSchema` | Formulario de login |
| `UserRegistrationSchema` | Registro con confirmación de contraseña |
| `ConfirmCodeSchema` | Verificación de email (código 6 dígitos) |
| `ForgotPasswordSchema` | Recuperación de contraseña |
| `ResetPasswordSchema` | Nueva contraseña con código |
| `BusinessRegistrationSchema` | Crear/editar negocio |
| `ProductRegistrationSchema` | Crear/editar producto |
| `FlashOfferRegistrationSchema` | Crear oferta relámpago |
| `SchedulesSchema` | Array de 7 horarios (uno por día) |

---

## Imágenes

### Construir URL de CloudFront

```typescript
import { getImageUrl } from "@/lib/utils";

getImageUrl(s3Key, "sm")  // 200px WebP
getImageUrl(s3Key, "md")  // 400px WebP (default)
getImageUrl(s3Key, "lg")  // 800px WebP
// Si s3Key es null/undefined → "/placeholder.jpg"
// Si CDN no está configurado → "/placeholder.jpg"
```

### Subir imagen desde un componente cliente

```tsx
import { FileUpload } from "@/components/ui/file-upload";

<FileUpload
  entityType="product"
  entityId={productId}
  maxFiles={10}
  onSuccess={(images) => queryClient.invalidateQueries({ queryKey: ["business", id] })}
/>
```

### Flujo interno de subida

```
1. POST /upload/presigned-url  → url firmada + key
2. PUT {url}                   → binario directo a S3 (sin Authorization)
3. POST /upload/confirm        → registra en DB
4. Lambda image-processor      → genera sm/md/lg WebP (asíncrono ~2s)
```

---

## Server Actions (`actions/`)

### `auth.ts`
```typescript
loginAction(email, password)       // login + setCookies + redirect /dashboard
registerAction(email, password)    // POST /auth/register
confirmEmailAction(email, code)    // POST /auth/confirm
resendCodeAction(email)            // POST /auth/resend-code
forgotPasswordAction(email)        // POST /auth/forgot-password
resetPasswordAction(email, code, newPassword)
upgradeRoleAction()                // POST /auth/become-owner
logoutAction()                     // limpia cookies + redirect /
getAuthSession()                   // lee cookies → { isLoggedIn, role, user }
```

### `mutations.ts`
```typescript
createBusinessAction(data)                    // redirect /dashboard
updateBusinessAction(id, data)                // revalidatePath
updateSchedulesAction(businessId, data)       // revalidatePath
createProductAction(businessId, data)         // redirect /dashboard/businesses/:id
createFlashOfferAction(businessId, data)      // redirect /offers
```

---

## Páginas principales

### Públicas

| Ruta | Descripción |
|---|---|
| `/` | Home con negocios destacados y ofertas activas |
| `/businesses` | Directorio con filtro por categoría y búsqueda |
| `/businesses/:id` | Perfil del negocio: info, horarios, catálogo con carrusel |
| `/flash-offers` | Todas las ofertas activas de la plataforma |
| `/search` | Búsqueda global en negocios, productos y categorías |

### Auth

| Ruta | Descripción |
|---|---|
| `/auth/login` | Login |
| `/auth/register` | Registro |
| `/auth/confirm` | Verificación de email |
| `/auth/forgot-password` | Recuperación de contraseña |

### Dashboard (requiere auth)

| Ruta | Rol mínimo | Descripción |
|---|---|---|
| `/dashboard` | visitor | Panel principal — muestra CTA si es visitor |
| `/dashboard/businesses/new` | owner | Crear negocio |
| `/dashboard/businesses/:id` | owner | Panel del negocio |
| `/dashboard/businesses/:id/settings` | owner | Editar info + horarios |
| `/dashboard/businesses/:id/products` | owner | Inventario completo |
| `/dashboard/businesses/:id/products/:productId` | owner | Editar producto + imágenes |
| `/dashboard/businesses/:id/offers` | owner | Gestionar ofertas relámpago |
| `/dashboard/businesses/:id/offers/new` | owner | Crear oferta |
| `/dashboard/products/new?businessId=` | owner | Crear producto |

---

## Componentes destacados

### `FileUpload`
Componente cliente para subir imágenes. Requiere `entityType` y `entityId`. Valida tipo (JPG/PNG/WebP) y tamaño (máx 10MB). Muestra preview local inmediato mientras sube.

### `Carousel` (Embla)
Usado en el modal de producto en `/businesses/:id`. Muestra todas las imágenes del producto con navegación prev/next. Solo muestra controles si hay más de 1 imagen.

### `SessionWatcher`
Componente cliente que verifica periódicamente si el token expiró y redirige al login automáticamente.

### `QueryProvider`
Envuelve la app con `QueryClientProvider` de TanStack Query. Configurado con `defaultOptions.queries.staleTime = 0`.

---

## Reglas de negocio en el frontend

| Regla | Dónde se aplica |
|---|---|
| Máx 30 productos — botón deshabilitado con tooltip | `/dashboard/businesses/:id/page.tsx` |
| Solo owners pueden acceder al dashboard | `middleware.ts` |
| Visitors redirigidos a `/dashboard` (CTA become-owner) | `middleware.ts` |
| Token expirado → logout automático | `apiFetch` + `SessionWatcher` |
| Imágenes: solo JPG/PNG/WebP, máx 10MB | `FileUpload` |

---

## Notas de desarrollo

- El carrusel en el modal de producto requiere que `getBusinessProductById` sea llamado para obtener `images[]`. `getProductsByBusinessId` solo devuelve `coverImage` como string plano.
- Para que `apiFetch` funcione en contexto cliente, el usuario debe hacer logout y login de nuevo después de actualizar el código (para generar el cookie `auth_token_client`).
- `NEXT_PUBLIC_USE_MOCK=true` es útil para desarrollar UI sin necesitar el backend activo. Los datos mock están en `lib/api.ts`.
