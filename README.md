# Portafolio de José Carlos Cusme Montenegro

Sitio personal en español creado con Astro y TypeScript. Presenta experiencia Full Stack y DevOps con contenido profesional general, sin información de sistemas empresariales internos.

## Desarrollo local

Requiere Node.js 24 o superior.

```bash
npm ci
npm run dev
```

Comprobaciones antes de publicar:

```bash
npm run check
npm run build
```

## Organización

- `src/data/profile.ts`: texto y datos tipados de experiencia, capacidades y enlaces.
- `src/components/`: secciones de la página.
- `src/styles/global.css`: sistema visual y diseño adaptable.
- `public/`: icono y versión pública del CV.

La página se genera como HTML estático. Las interacciones son mejoras progresivas: el contenido y los enlaces funcionan sin JavaScript.

## Publicación

El repositorio público debe llamarse `cusmegoat.github.io`. En **Settings → Pages**, elegir **GitHub Actions** como origen. Cada cambio en `main` ejecuta `.github/workflows/deploy.yml` y publica el sitio en <https://cusmegoat.github.io/>.

Antes de compartir el CV, revisar `public/cv-jose-carlos-cusme-montenegro.pdf` y los datos de contacto de `src/data/profile.ts`.

La versión pública del CV se puede volver a generar con `python scripts/build_public_cv.py` después de instalar `reportlab`. El archivo original privado no forma parte de este repositorio.
