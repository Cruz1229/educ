# Revisión Android de Cromix, Magix y BioFlor

Fecha: 9 de septiembre de 2026.

Se corrigieron las tres plantillas Android locales de EducSTEAM y se generaron APK de prueba a partir de los ZIP personalizados por el mismo código de descarga del generador.

## Fallos corregidos

- Los tres ZIP solo incluían `android/`, pero `capacitor.settings.gradle` referenciaba `../node_modules/@capacitor/...`. Faltaban los cinco módulos nativos necesarios para compilar. Ahora están dentro de `android/vendor/`, con rutas relativas, versiones y licencias; se puede abrir únicamente la carpeta Android.
- Cromix y BioFlor bloqueaban el botón de descarga hasta cargar JSZip desde un CDN, pese a que `gameDownloadPackaging` ya lo importa localmente. Se eliminó esa carga externa y su espera.
- Cada plantilla incluye `android/README.md` con instrucciones de extracción, compilación y ejecución.

## Verificación

| Comprobación | Cromix | Magix | BioFlor |
| --- | --- | --- | --- |
| Descarga Android y combinación Web + Android | Correcta | Correcta | Correcta |
| ZIP íntegro y dependencias dentro de Android | Correcto | Correcto | Correcto |
| Configuración, nombre e identificador personalizados | Correctos | Correctos | Correctos |
| Botón de descarga sin JSZip externo | Funciona | Funciona | Funciona |
| `gradlew.bat assembleDebug` desde el ZIP extraído | Correcto | Correcto | Correcto |
| Recursos del ZIP conservados exactamente en la APK | 6 archivos | 26 archivos | 28 archivos |
| Ejecución en teléfono/emulador | Pendiente | Pendiente | Pendiente |

Pasaron 30 pruebas en 6 suites. También finalizaron correctamente `npm run build` y el arranque con `npm start` del generador. Las advertencias existentes de lint y tamaño del paquete no impidieron la compilación.

Se verificaron por HTTP local la página del generador, `/settings` y las tres rutas `/templates/<juego>_android.zip`. Los ZIP servidos y los incluidos en `build/templates` coinciden con las plantillas corregidas.

Las tres compilaciones Android usaron JDK 21, SDK 36 y la caché local de Gradle (`--offline --no-daemon --max-workers=2`). Esto prueba la compilación de los proyectos extraídos, pero no una primera descarga de Gradle/Maven en un equipo nuevo. Android Studio necesitará Internet para obtener esas herramientas y bibliotecas en la primera sincronización.

No se confirmó la ejecución de las APK en un dispositivo: al intentar instalarlas, ADB no encontró teléfonos conectados ni emuladores configurados. No se instaló ninguna APK. Los cambios están en el proyecto local y su compilación; no se publicó una actualización del sitio en línea.

## Archivos para probar

En `../entregables-moviles/revision-android-20260909/`, respecto a la raíz de EducSTEAM:

- `cromix_android.zip`, `magix_android.zip`, `bioflor_android.zip`: proyectos personalizados usados para la compilación.
- `cromix-debug.apk`, `magix-debug.apk`, `bioflor-debug.apk`: APK resultantes.
- `<juego>_download.zip`: archivo exterior tal como lo genera la descarga Android.
- `tests.log`, `educsteam-build.log`, `educsteam-start.log`, `<juego>/android-build.log`: resultados de las comprobaciones.
- `verification.json` y `http-verification.json`: tamaños, SHA-256 y comprobación de recursos y descargas HTTP.

Los paquetes de revisión usan nombres terminados en “revisión” e identificadores `io.educsteam.review.<juego>`. Las plantillas públicas mantienen sus valores base y el generador personaliza cada nueva descarga.

## Abrir y ejecutar un proyecto descargado

1. Extraer el ZIP exterior del generador y después el ZIP terminado en `_android.zip` que está dentro de la carpeta del juego.
2. Abrir en Android Studio la carpeta `android`, donde están `settings.gradle` y `gradlew.bat`.
3. Configurar JDK 21 y SDK 36; esperar a que termine la sincronización.
4. Seleccionar un teléfono o emulador con Android 7.0/API 24 o posterior y pulsar Run.

Para compilar desde Windows, ejecutar desde `android`:

```powershell
.\gradlew.bat assembleDebug
```

La APK aparece en `app/build/outputs/apk/debug/app-debug.apk`. La configuración personalizada permanece en `app/src/main/assets/public/config/<juego>-config.json`.

## Mantener las plantillas

Si se reemplaza alguna de estas plantillas por un nuevo ZIP que vuelva a depender de `node_modules`, ejecutar desde EducSTEAM:

```powershell
node scripts/make-android-templates-portable.cjs ../bioflor-mobile/node_modules
```

El script exige las versiones probadas: Capacitor Android 8.0.2 y App, Haptics, Keyboard y Status Bar 8.0.0. Incluye sus fuentes Android sin carpetas de compilación, rutas locales ni archivos de firma. Después se deben repetir las pruebas y compilar el generador.
