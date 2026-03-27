# Adivina Sport — Portal de Clubes

Portal privado para clubes deportivos de élite. Gestión de contratos, facturas, puntos y equipamiento.

---

## Arquitectura

```
adivina-sport/
├── frontend/   # React 19 + Tailwind CSS + shadcn/ui  (puerto 3000)
└── backend/    # Next.js 14 API Routes + Supabase      (puerto 3001)
```

El **frontend** es una SPA en React que consume la API del **backend**. El backend actúa como capa intermedia entre el frontend y Supabase (PostgreSQL + Storage), evitando exponer las claves de servicio al cliente.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, React Router v7, Tailwind CSS, shadcn/ui, Axios |
| Backend | Next.js 14 (solo API Routes, sin páginas), Node.js |
| Base de datos | Supabase (PostgreSQL) |
| Almacenamiento | Supabase Storage (PDFs, imágenes) |
| Autenticación | JWT simple con bcryptjs (sin Supabase Auth) |

---

## Requisitos previos

- Node.js ≥ 18.17
- Cuenta en [Supabase](https://supabase.com)
- Proyecto Supabase creado con el schema de `supabase/schema.sql`

---

## Variables de entorno

### Backend (`backend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ALLOWED_ORIGINS=http://localhost:3000
SEED_SECRET=<clave-secreta-para-seed>
```

### Frontend (`frontend/.env.local`)

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

---

## Instalación y desarrollo local

```bash
# 1. Clonar el repo
git clone <url-repo>
cd adivina-sport

# 2. Instalar dependencias del backend
cd backend && npm install

# 3. Instalar dependencias del frontend
cd ../frontend && npm install

# 4. Levantar backend (puerto 3001)
cd ../backend && npm run dev

# 5. Levantar frontend (puerto 3000) — en otra terminal
cd ../frontend && npm start
```

### Seed de datos iniciales

Una vez levantado el backend, ejecuta una sola vez:

```
GET http://localhost:3001/api/auth/seed?key=<SEED_SECRET>
```

Esto crea el admin (`admin` / `adivina2026`) y cuatro clubes de prueba.

---

## Buckets de Supabase Storage

Crea estos buckets manualmente en el dashboard de Supabase → Storage:

| Bucket | Acceso | Uso |
|---|---|---|
| `contratos-pdf` | Privado | PDFs de contratos y facturas |
| `logos-clubes` | Público | Escudos/logos de los clubes |
| `players-photos` | Público | Fotos de jugadores |
| `equipment-designs` | Público | Imágenes de diseños de kit |

---

## Funcionalidades

### Panel del club (miembro)
- Dashboard con noticias, estadísticas, plantilla y directiva
- Contratos con descarga de PDF (URL firmada desde Supabase Storage)
- Facturas con cálculo automático de intereses por mora
- Sistema de puntos e historial
- Diseño de kit (visualización de diseños aprobados)
- Solicitudes al administrador
- Perfil del club: directiva, jugadores, colores, equipos

### Panel de administrador
- Gestión completa de clubes (CRUD + logo)
- Subida de contratos PDF por club
- Gestión de facturas con periodo de gracia e interés mensual
- Ajuste manual de puntos
- Motor de reglas de puntos
- Sistema de niveles de membresía (Silver / Gold / Premium / Elite)
- Noticias y contenido del dashboard
- Respuesta a solicitudes
- Reset de datos por tipo y club

---

## Despliegue

El proyecto está pensado para desplegarse en **Vercel** (backend como proyecto Next.js independiente) y en **Vercel / Netlify** (frontend como build estático de Create React App).

### Backend en Vercel

```bash
cd backend
vercel --prod
```

Variables de entorno requeridas en Vercel: las mismas que en `backend/.env.local`, más:

```env
ALLOWED_ORIGINS=https://<tu-dominio-frontend>.vercel.app
```

### Frontend en Vercel / Netlify

```bash
cd frontend
# Vercel
vercel --prod

# Netlify
npm run build && netlify deploy --prod --dir=build
```

Variable de entorno requerida:

```env
REACT_APP_BACKEND_URL=https://<tu-backend>.vercel.app
```

---

## Notas importantes

- Los PDFs de contratos se almacenan con rutas relativas en la columna `file_url` de Supabase. El backend genera **URLs firmadas** (válidas 1 hora) antes de enviarlas al frontend. No uses `${BACKEND_URL}${file_url}` directamente en el cliente.
- El token de sesión (`club_<id>`) se almacena en `localStorage`. No es un JWT estándar — es un identificador simple para esta implementación.
- El bucket `contratos-pdf` debe ser **privado** para que las URLs firmadas sean necesarias y los PDFs no sean accesibles públicamente.

---

## Licencia

Privado — todos los derechos reservados © 2026 Adivina Sport.
