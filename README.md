# To-Do List App — Ionic + Angular

Aplicación de gestión de tareas con categorías, filtros y feature flags via Firebase Remote Config. Construida con Ionic 8 y Angular 20 usando standalone components.

---

## Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| Angular | 20 | Framework base (standalone components + Signals) |
| Ionic | 8 | UI components y compilación móvil |
| Cordova | latest | Build nativo Android/iOS |
| @ionic/storage-angular | 4 | Persistencia local (SQLite en nativo, IndexedDB en web) |
| Firebase | 12 | Remote Config para feature flags |
| Angular CDK | 20 | Utilidades de layout y accesibilidad |

---

## Funcionalidades

- **Tareas**: agregar, completar (checkbox), editar y eliminar (swipe)
- **Categorías**: crear con color personalizado, editar y eliminar
- **Filtros**: filtrar tareas por categoría via chips
- **Feature flag**: `enable_task_priority` — activa/desactiva campo de prioridad en tareas
- **Persistencia**: todas las tareas y categorías se guardan localmente
- **Dark mode**: soporte automático según preferencia del sistema

---

## Requisitos previos

### General
- Node.js >= 18
- npm >= 9
- Git

### Para Android
- Android Studio (Hedgehog o superior)
- JDK 17
- Android SDK con API Level 34
- Variable de entorno `ANDROID_HOME` configurada

### Para iOS (solo macOS)
- Xcode 15+
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account

### Ionic y Cordova CLI
```bash
npm install -g @ionic/cli cordova
```

---

## Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone https://github.com/LoraDev010/app-to-do-list.git
cd app-to-do-list

# 2. Instalar dependencias
npm install

# 3. Ejecutar en el navegador
npm start
```

La app estará disponible en `http://localhost:4200`.

---

## Configurar Firebase

### 1. Crear proyecto en Firebase Console
1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. En **Project settings > General** copiar la configuración del SDK web

### 2. Configurar credenciales en la app
Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
  },
};
```

Repetir en `src/environments/environment.prod.ts` con los mismos valores (o valores de producción separados).

### 3. Activar Remote Config
1. En Firebase Console ir a **Remote Config**
2. Crear parámetro: `enable_task_priority` — tipo Boolean, valor por defecto `false`
3. Para activar la funcionalidad: cambiar valor a `true` y publicar

### 4. Demo del feature flag
- **Flag OFF** (`false`): el formulario de tarea solo muestra título y categoría
- **Flag ON** (`true`): aparece selector de prioridad (Alta/Media/Baja) con badge visual en cada tarea

---

## Compilar para Android

### Preparar plataforma (solo primera vez)
```bash
ionic cordova platform add android
```

### Build de desarrollo
```bash
npm run run:android
# o
ionic cordova run android
```

### APK de producción
```bash
npm run build:android
# o
ionic cordova build android --prod
```

El APK generado se encuentra en:
```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### APK firmado (release)
```bash
ionic cordova build android --prod --release
```

Luego firmar con `jarsigner` o desde Android Studio.

---

## Compilar para iOS (requiere macOS + Xcode)

### Preparar plataforma (solo primera vez)
```bash
ionic cordova platform add ios
cd platforms/ios && pod install && cd ../..
```

### Build de desarrollo
```bash
npm run run:ios
# o
ionic cordova run ios --target="iPhone 15"
```

### Archivo IPA (producción)
```bash
npm run build:ios
# o
ionic cordova build ios --prod
```

Luego en Xcode:
1. Abrir `platforms/ios/To-Do List.xcworkspace`
2. **Product > Archive**
3. **Distribute App > Ad Hoc** o **App Store**

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en localhost:4200 |
| `npm run build` | Build de producción para web |
| `npm test` | Ejecutar tests unitarios |
| `npm run build:android` | Build APK para Android |
| `npm run build:ios` | Build IPA para iOS |
| `npm run run:android` | Ejecutar en dispositivo/emulador Android |
| `npm run run:ios` | Ejecutar en dispositivo/emulador iOS |

---

## Arquitectura

```
src/app/
├── core/
│   ├── models/          # Interfaces TypeScript (Task, Category)
│   └── services/        # Lógica de negocio con Signals
├── features/
│   ├── tasks/           # Página de tareas + form + item component
│   └── categories/      # Página de categorías + form
├── shared/
│   └── components/      # Componentes reutilizables (EmptyState)
└── tabs/                # Navegación por tabs
```

### Decisiones de arquitectura

- **Standalone components**: sin NgModules, tree-shakeable, lazy loading por ruta
- **Angular Signals**: estado reactivo síncrono, sin boilerplate de BehaviorSubject
- **ChangeDetectionStrategy.OnPush**: re-renders solo cuando los inputs o signals cambian
- **@ionic/storage-angular**: abstrae SQLite (nativo) / IndexedDB (web) transparentemente
- **Arquitectura de capas**: StorageService → TaskService/CategoryService → Components. Cambiar la BD solo impacta StorageService
- **Firebase Remote Config**: configuración del servidor sin redeploy de la app

---

## Estructura del feature flag

```typescript
// RemoteConfigService expone un Signal reactivo
readonly enableTaskPriority = signal(false);

// Los componentes lo consumen directamente
@if (remoteConfig.enableTaskPriority()) {
  <ion-item>...</ion-item>  // Selector de prioridad
}
```

Cuando se cambia el flag en Firebase Console y la app lo detecta (al iniciar o tras el TTL de 12h en producción), la UI se actualiza reactivamente sin rebuild ni redeploy.

---

## Preguntas técnicas de la evaluación

### ¿Cuáles fueron los principales desafíos?

1. **Incompatibilidad ModalController + Signal inputs**: `ModalController.create({ componentProps })` asigna props directamente a la instancia del componente, destruyendo las funciones signal. Solución: usar `@Input()` clásico en componentes abiertos via modal.

2. **IonInput no propaga a FormControl**: En Ionic 8 + Angular 20, el `ControlValueAccessor` de `IonInput` no siempre propaga keystrokes al `FormControl`. Solución: manejador `(ionInput)` que sincroniza manualmente el valor.

3. **APP_INITIALIZER vs token custom**: Al usar un token string `'APP_INIT'` Angular no ejecutaba la inicialización de Firebase antes del bootstrap. Solución: usar `APP_INITIALIZER` oficial de `@angular/core` con `multi: true`.

### ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

| Técnica | Implementación | Beneficio |
|---|---|---|
| **OnPush CD** | Todos los componentes | Angular solo re-renderiza cuando signals o inputs cambian |
| **track en @for** | `@for (task of tasks; track task.id)` | Angular reutiliza DOM existente, solo actualiza lo que cambió |
| **Signals + computed()** | `signal<Task[]>([])`, `computed()` | Actualizaciones granulares sin Zone.js overhead |
| **Lazy Loading** | `loadComponent: () => import(...)` | Bundle inicial pequeño, carga rutas bajo demanda |
| **PreloadAllModules** | `withPreloading(PreloadAllModules)` | Precarga rutas en background tras carga inicial |
| **Inmutabilidad** | `_tasks.update(list => [...list, new])` | OnPush detecta cambios por referencia, no por valor |

### ¿Cómo aseguraste la calidad y mantenibilidad del código?

1. **Separación de responsabilidades**: Services manejan estado y persistencia. Components solo presentan datos. Sin lógica de negocio en templates.

2. **Modelos tipados**: Interfaces `Task` y `Category` con TypeScript strict. El compilador detecta errores antes de runtime.

3. **Servicios singleton** (`providedIn: 'root'`): Una única instancia compartida. Sin riesgo de estados desincronizados entre componentes.

4. **Manejo de errores con rollback**: Cada operación async guarda el estado previo. Si falla, revierte el signal y muestra un `IonToast` al usuario.

5. **Feature flags**: `enable_task_priority` en Firebase Remote Config permite activar funcionalidad sin redeploy, reduciendo riesgo en releases.

6. **Arquitectura de capas**: `StorageService` → `TaskService/CategoryService` → Components. Si cambia la BD, solo se modifica `StorageService`.

---

## Rama de desarrollo

```
clean-history
```

El commit inicial incluye la estructura base completa del proyecto.
