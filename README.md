# Portafolio de José Carlos Cusme Montenegro

Portafolio profesional en español para presentar experiencia Full Stack y DevOps. Está publicado en <https://cusmegoat.github.io/> y su código vive en este repositorio público.

## Cómo funciona

Este proyecto usa **Astro + TypeScript** y generación estática. Astro toma el contenido y los componentes, genera archivos HTML, CSS y JavaScript en `dist/`, y GitHub Pages sirve esos archivos. El visitante no necesita un servidor de aplicación, una API ni una base de datos para ver el portafolio.

```text
Datos y componentes en src/ ──> Astro build ──> dist/
                                              │
GitHub Actions al recibir un push en main ────┘
                  │
                  └──> GitHub Pages ──> https://cusmegoat.github.io/
```

La organización sigue **composición de componentes** y **separación entre datos y presentación**: `profile.ts` contiene los datos profesionales; los componentes deciden cómo mostrarlos. El portafolio incluye el retrato de José Carlos, una franja móvil de tecnologías, habilidades detalladas, casos de proyectos y un selector de tema claro u oscuro. Las animaciones son una mejora progresiva: el contenido permanece disponible sin JavaScript y con la preferencia de movimiento reducido. El tema elegido se guarda en el navegador cuando este permite almacenamiento local.

## Estructura del repositorio

| Ruta | Función |
| --- | --- |
| `src/data/profile.ts` | Datos tipados de perfil, experiencia, habilidades, proyectos, formación y enlaces. |
| `src/pages/index.astro` | Página principal; reúne las secciones y define la ruta `/`. |
| `src/layouts/BaseLayout.astro` | Estructura HTML, metadatos y recursos comunes. |
| `src/components/` | Secciones reutilizables: presentación, franja de tecnologías, perfil, experiencia, habilidades, proyectos, formación y contacto. |
| `src/styles/global.css` | Colores, tipografía, diseño adaptable y reglas de movimiento reducido. |
| `public/` | Archivos que se copian tal cual al sitio, incluidos el retrato, el icono y el CV público. |
| `scripts/build_public_cv.py` | Genera la versión pública del CV en PDF. |
| `.github/workflows/deploy.yml` | Comprueba, construye y publica el sitio automáticamente. |
| `package.json` / `package-lock.json` | Dependencias y comandos de desarrollo, con versiones reproducibles. |
| `astro.config.mjs` / `tsconfig.json` | Configuración de Astro y TypeScript. |
| `.gitignore` | Evita subir dependencias, archivos temporales y la salida generada. |

`dist/` se genera al compilar y no se guarda en Git. GitHub Actions lo vuelve a generar en cada publicación.

## Desarrollo local

Requiere Node.js 24 o superior. Desde la carpeta del proyecto:

```bash
npm ci
npm run dev
```

Astro muestra una dirección local para revisar los cambios. Antes de enviarlos:

```bash
npm run check
npm run build
```

Para cambiar textos, fechas o enlaces, edita `src/data/profile.ts`. Para cambiar el aspecto, edita `src/styles/global.css` o el componente correspondiente. Si añades una sección, crea su componente y agrégalo a `src/pages/index.astro`.

Los casos empresariales usan títulos genéricos y descripciones públicas de alto nivel; no incluyen código, clientes, nombres internos ni enlaces a repositorios privados. Antes de editar un caso, verifica que el reto, el aporte personal y el stack puedan divulgarse.

El CV descargable está en `public/cv-jose-carlos-cusme-montenegro.pdf`. Revisa siempre su contenido antes de publicarlo. Para regenerarlo, instala `reportlab` y ejecuta `python scripts/build_public_cv.py`. El CV original privado no forma parte del repositorio.

## Publicación

El nombre `cusmegoat.github.io` identifica un sitio personal de GitHub Pages y permite usar <https://cusmegoat.github.io/> sin comprar dominio. En **Settings → Pages**, el origen está configurado como **GitHub Actions**.

Cada `push` a `main` ejecuta `.github/workflows/deploy.yml`:

1. Descarga el código y ejecuta `npm ci` y `npm run check`.
2. Astro genera el sitio en `dist/`.
3. GitHub Actions entrega los archivos generados a GitHub Pages.
4. Pages actualiza la dirección pública.

Para comprobarlo, abre **Actions → Publicar portafolio** y verifica que `build` y `deploy` aparezcan en verde. Después abre la página y descarga el CV.

### Sobre la X roja del primer commit

Al crear el repositorio, Pages inició automáticamente con el origen **Deploy from a branch**. Su flujo predeterminado intentó construir los archivos `.astro` con Jekyll y falló. Cambié el origen a **GitHub Actions**; el flujo **Publicar portafolio** del mismo commit terminó correctamente y el sitio quedó publicado. GitHub conserva el resultado fallido de aquel flujo inicial en el historial de comprobaciones.
