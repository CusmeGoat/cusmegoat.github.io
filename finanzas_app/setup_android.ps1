$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  throw 'Instala Flutter y Android Studio; después vuelve a ejecutar este archivo.'
}

flutter create --platforms=android --project-name=bolsillo_claro --org=com.josecarlos .
if ($LASTEXITCODE -ne 0) { throw 'Flutter no pudo crear la estructura Android.' }

$templateTestPath = Join-Path $PSScriptRoot 'test/widget_test.dart'
if ((Test-Path -LiteralPath $templateTestPath) -and
    ((Get-Content -LiteralPath $templateTestPath -Raw) -match 'MyApp\(')) {
  Remove-Item -LiteralPath $templateTestPath
}

$manifestPath = Join-Path $PSScriptRoot 'android/app/src/main/AndroidManifest.xml'
[xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
$root = $manifest.DocumentElement
$androidNs = 'http://schemas.android.com/apk/res/android'
$namespaceManager = New-Object System.Xml.XmlNamespaceManager($manifest.NameTable)
$namespaceManager.AddNamespace('android', $androidNs)
$application = $root.SelectSingleNode('application')
$application.SetAttribute('label', $androidNs, 'Bolsillo Claro')

$microphone = $root.SelectSingleNode("uses-permission[@android:name='android.permission.RECORD_AUDIO']", $namespaceManager)
if ($null -eq $microphone) {
  $permission = $manifest.CreateElement('uses-permission')
  $permission.SetAttribute('name', $androidNs, 'android.permission.RECORD_AUDIO')
  [void]$root.InsertBefore($permission, $root.FirstChild)
}

$queries = $root.SelectSingleNode('queries')
if ($null -eq $queries) {
  $queries = $manifest.CreateElement('queries')
  [void]$root.InsertBefore($queries, $root.FirstChild)
}

$speechQuery = $queries.SelectSingleNode("intent/action[@android:name='android.speech.RecognitionService']", $namespaceManager)
if ($null -eq $speechQuery) {
  $intent = $manifest.CreateElement('intent')
  $action = $manifest.CreateElement('action')
  $action.SetAttribute('name', $androidNs, 'android.speech.RecognitionService')
  [void]$intent.AppendChild($action)
  [void]$queries.AppendChild($intent)
}

$manifest.Save($manifestPath)
flutter pub get
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron descargar las dependencias.' }
flutter analyze
if ($LASTEXITCODE -ne 0) { throw 'El análisis de Flutter encontró errores.' }
flutter test
if ($LASTEXITCODE -ne 0) { throw 'Las pruebas fallaron.' }

Write-Host 'Proyecto Android preparado. Conecta tu teléfono y ejecuta: flutter run'
