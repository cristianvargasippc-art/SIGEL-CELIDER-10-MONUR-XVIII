# Club Escolar R10 - PLE-RD

Sistema de registro, QR y check-in para evento educativo del Ministerio de Educación de República Dominicana.

## Ejecutar localmente

1. Copia `.env.example` a `.env.local`.
2. Completa las variables de entorno.
3. Ejecuta `supabase/schema.sql` en Supabase SQL Editor.
4. Inicia la app:

```bash
npm run dev
```

## Variables de entorno requeridas en Vercel

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
ADMIN_SECRET=
NEXT_PUBLIC_QR_SECRET=
```

El sistema no requiere email transaccional. Al completar el registro, la plataforma muestra el QR en pantalla para que el participante tome captura.

## Logo

Coloca el logo oficial en:

```bash
public/imagenes/logo.png
```

Ese archivo se usa en la página principal, el login administrativo y el dashboard.

## Deploy en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel, selecciona `Add New Project`.
3. Importa el repositorio desde GitHub.
4. Configura las variables de entorno listadas arriba en `Project Settings > Environment Variables`.
5. Define `NEXT_PUBLIC_APP_URL` con el dominio final de Vercel, por ejemplo `https://tu-proyecto.vercel.app`.
6. Ejecuta el deploy. Vercel detectará Next.js automáticamente.

## Seguridad

`next.config.js` incluye estos headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

El panel administrativo usa login server-side con `ADMIN_SECRET` y una cookie `httpOnly`. Los endpoints administrativos también aceptan `Authorization: Bearer ADMIN_SECRET` para integraciones server-to-server.
