# Bolsillo Claro · primera versión

Aplicación Android para registrar ingresos y gastos, comprobar pagos mensuales y revisar un resumen mensual y anual. Se construyó como proyecto independiente dentro de este repositorio; no forma parte del portafolio publicado.

## Funciones incluidas

- Registro manual de ingresos y gastos con fecha, categoría e indicador necesario/opcional.
- Resumen del mes, saldo (`ingresos - gastos`), vista anual y desglose por categoría.
- Lista de obligaciones mensuales. Al registrar un pago se crea un único gasto vinculado; se avisa si ya había un pago de esa obligación en el mes.
- Sugerencia mensual calculada a partir de cifras reales, sin generar importes ni consejos de inversión.
- Entrada por voz local cuando el servicio del teléfono la admite. También se puede escribir la frase. Cada movimiento propuesto se revisa por separado; un importe ausente debe completarse.
- Base de datos SQLite local. La aplicación no incorpora cuentas ni sincronización.

## Arquitectura

`lib/ui` contiene las pantallas y captura de voz. `lib/domain` contiene los modelos, cálculos y la interpretación de frases. `lib/data` guarda y consulta SQLite. La interfaz depende del repositorio, y los cálculos no dependen de Flutter ni de la base de datos. Esta es una primera aplicación de la separación MVVM y repositorios propuesta para el proyecto.

Se usa `sqflite` directamente en esta versión para mantener el proyecto pequeño y evitar código generado. La interfaz del repositorio permite migrar a Drift sin cambiar las reglas financieras ni las pantallas.

## Preparación y ejecución

Se necesita Flutter con Dart 3.12 o superior, Android Studio con Android SDK y un teléfono Android o emulador. En PowerShell, desde esta carpeta:

```powershell
.\setup_android.ps1
flutter run
```

El script genera la estructura Android estándar, añade el permiso de micrófono, descarga dependencias, analiza el código y ejecuta las pruebas. Para generar un APK de prueba:

```powershell
flutter build apk --debug
```

El APK queda en `build/app/outputs/flutter-apk/app-debug.apk`. La primera vez que uses voz, Android pedirá permiso para el micrófono. El reconocimiento se solicita con la opción `onDevice`; si el servicio local o el español no están disponibles, escribe la frase en la misma pantalla.

## Límites de esta versión

- No hay copia de seguridad, sincronización, bloqueo de la app ni cifrado adicional de la base de datos. Los datos permanecen en el almacenamiento privado de la aplicación, pero se perderán al desinstalarla si no existe una copia externa.
- La interpretación de voz cubre frases breves con verbos comunes e importes expresados con números. No interpreta todos los modos de hablar ni cantidades dichas solo con palabras.
- Los pagos mensuales son una lista de control; no se crean gastos por sí solos ni hay recordatorios automáticos.
- Las categorías y el carácter necesario/opcional se pueden corregir al registrar cada gasto. La edición posterior de un movimiento aún no está incluida; se puede eliminar y volver a crear.
- La moneda visualizada es USD. No hay conversión de divisas ni tratamiento contable de ganancias de negocio.

## Pruebas

`test/finance_service_test.dart` verifica el saldo y que un pago solo corresponda al mes correcto. `test/voice_parser_test.dart` verifica la separación de dos gastos y que los importes ausentes no se inventen. Se ejecutan con `flutter test` cuando el SDK esté instalado.
