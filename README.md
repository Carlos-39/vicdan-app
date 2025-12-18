Proyecto VicDan — aplicación web basada en Next.js

Descripción
- Este repositorio contiene una aplicación web construida con Next.js (App Router) que incluye autenticación, gestión de perfiles y una colección de componentes reutilizables.
- El código está organizado en `src/` y contiene una carpeta `app/` con las páginas/plantillas de la aplicación.

Estructura principal
- `src/app/` : rutas y páginas de la aplicación (App Router).
- `src/components/` : componentes UI reutilizables y específicos (perfiles, theme editor, UI primitives).
- `src/lib/` : utilidades y helpers (jwt, supabase, storage, utils, etc.).
- `src/types/` : tipos TypeScript del proyecto.
- `public/` : archivos estáticos accesibles públicamente.
- `e2e/` : pruebas end-to-end con Playwright (carpetas por flujo: `auth`, `DashBoard`, etc.).
- `test/` : pruebas unitarias e integración (incluye `msw/` para mocks y `unit/` y `integration/`).
- Configuración y scripts importantes en la raíz: `package.json`, `next.config.ts`, `jest.config.js`, `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`.

Comandos básicos
- Instalar dependencias:

```
npm install
```

- Ejecutar en modo desarrollo:

```
npm run dev
```

- Construir para producción:

```
npm run build
```

- Ejecutar pruebas unitarias (Jest):

```
npm test
```

- Ejecutar pruebas E2E (Playwright):

```
npx playwright test
```

Puntos a tener en cuenta
- La aplicación usa autenticación y acceso a datos (se observan utilidades `supabase.ts`, `jwt.ts` y `storage.ts`). Configura tus variables de entorno antes de ejecutar en desarrollo (`.env.local` o similar) si la app requiere claves externas.
- Hay helpers y utilidades para manejo de fechas, slugs y rate limiting en `src/lib/`.
- Las pruebas E2E están en la carpeta `e2e/` y se organizan por flujos (auth, dashboard, etc.). También hay pruebas unitarias y mocks de red con MSW en `test/msw/`.

Contribuir
- Lee y sigue las convenciones de código presentes (TypeScript, ESLint, estructura de carpetas).
- Añade tests para nuevas funcionalidades y mantén actualizados los mocks en `test/msw/`.

Contacto
- Para dudas o colaboración, crea un issue o un PR en este repositorio.

Licencia
- Revisa el archivo `LICENSE` en la raíz para detalles de la licencia del proyecto.

---

Este README resume la estructura y los comandos principales del proyecto tal como está en el repositorio.
