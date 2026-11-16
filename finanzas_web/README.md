# Bolsillo Claro · versión web responsiva

Esta es la versión para laptop y celular. Es una **PWA**: se abre en el navegador y, en navegadores compatibles, se puede añadir a la pantalla de inicio. Está separada del portafolio Astro de la raíz y del primer prototipo Android en `finanzas_app`.

## Estado real

El código web está preparado para Vercel, pero **todavía no está desplegado**. Sin configurar Supabase, funciona en modo local: cada navegador guarda sus propios datos. Para que laptop y celular vean los mismos movimientos se necesita el modo nube con una cuenta privada y la base de datos Supabase.

La arquitectura separa `app.js` (interfaz), `domain.js` (cálculos e interpretación de frases) y `data.js` (almacenamiento local o sincronizado). Vercel sirve la interfaz y una función que entrega solo la URL y la clave pública de Supabase; Supabase gestiona el inicio de sesión y los datos. La clave secreta no se usa en el navegador.

## Probar ahora en la laptop

Desde PowerShell, en esta carpeta:

```powershell
npm run dev
```

Abre **http://localhost:4173**. Aparecerá el resumen en **modo local**. Prueba este recorrido:

1. Pulsa **Nuevo movimiento** y añade un ingreso, por ejemplo «Sueldo», $1000.
2. Añade un gasto de «Internet», $30, marcado como necesario.
3. En **Pagos mensuales**, crea «Luz» y pulsa **Registrar** para marcarlo como pagado.
4. En **Registrar con voz**, escribe «Compré una torta de 5 dólares» y revisa el gasto propuesto. Si el navegador permite reconocimiento de voz local en español, también puedes dictarlo.
5. Cambia de mes y revisa el saldo, las categorías y el panorama anual.
6. En **Ajustes y copia**, exporta una copia JSON si quieres conservar los datos de prueba.

Los datos locales permanecen en ese navegador. No aparecerán automáticamente en otro dispositivo. El servidor de prueba puede cerrarse con `Ctrl+C`.

Comprobaciones del código:

```powershell
npm run check
npm test
npm run build
```

## Sincronizar y publicar en Vercel

1. Crea un proyecto personal en Supabase. En **SQL Editor**, ejecuta [supabase_schema.sql](supabase_schema.sql). Las políticas RLS limitan cada fila al usuario autenticado.
2. Importa este repositorio en Vercel como **proyecto nuevo** y configura **Root Directory** = `finanzas_web`. El proyecto incluye `vercel.json`; Vercel ejecutará `npm run build` y publicará `dist`.
3. En Vercel añade estas variables de entorno y vuelve a desplegar: `SUPABASE_URL` (URL de tu proyecto) y `SUPABASE_PUBLISHABLE_KEY` (clave pública). **No uses** `sb_secret_...`, `service_role` ni contraseñas aquí.
4. En Supabase, configura **Authentication → URL Configuration → Site URL** con la URL HTTPS asignada por Vercel. En **Authentication → Users**, usa **Add user → Send invitation** para invitarte a tu propio correo y terminar la creación de tu contraseña. Desactiva **Allow new users to sign up** para que solo la cuenta existente pueda entrar.
5. Abre la URL de Vercel en laptop y celular e inicia sesión con la misma cuenta. Los movimientos que registres en modo nube se consultarán desde ambos dispositivos.

Vercel permite elegir la carpeta raíz de un proyecto dentro del repositorio; la configuración de la base y el inicio de sesión se hacen en Supabase. Documentación: [Vercel: monorepos](https://vercel.com/docs/monorepos), [Supabase: usuarios](https://supabase.com/docs/guides/auth/users), [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

**Importante:** al pasar del modo local al modo nube, los datos locales no se transfieren solos. Exporta la copia JSON en modo local y luego impórtala tras iniciar sesión en modo nube. La importación conserva los identificadores para evitar duplicados si repites la misma copia.

## Uso en el celular

La interfaz cambia a navegación inferior y tarjetas compactas en pantallas pequeñas. Tras el despliegue, abre la URL HTTPS de Vercel en el navegador del Redmi. En un navegador que permita instalar PWA, usa la opción **Añadir a pantalla de inicio** o **Instalar aplicación**. El reconocimiento de voz se activa únicamente si el navegador permite exigir procesamiento local; en otros casos puedes escribir la frase. La [compatibilidad de voz local en la web varía según el navegador](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally).

## Límites de esta primera versión

- El modo local funciona sin cuenta y sin sincronización. El modo nube requiere conexión a internet para leer y escribir datos.
- Las sugerencias se calculan de tus movimientos; no son consejos de inversión ni usan un modelo generativo.
- El reconocimiento de frases admite verbos e importes comunes escritos con números. Siempre se revisa cada propuesta antes de guardar.
- La moneda mostrada es USD. No hay conversión de divisas ni contabilidad de negocio.
- La copia JSON no está cifrada; guárdala en un lugar privado. No se guardan archivos de audio.
- Esta versión permite añadir y eliminar movimientos y pagos. Para corregir uno ya guardado, elimínalo y créalo de nuevo.
