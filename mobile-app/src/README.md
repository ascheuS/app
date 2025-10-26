# 📱 SIGRA Mobile App - Guía de Módulos

## 📚 Estructura del Proyecto

El proyecto está dividido en tres módulos principales:

### 1. 📝 Módulo de Reportes
- **Propósito**: Crear y ver reportes de incidentes
- **Ubicación**: `src/modules/reports/`
- **Archivos principales**:
  - `screens/ReportListScreen.tsx`: Lista de reportes
  - `screens/CreateReportScreen.tsx`: Formulario de creación
- **Características**:
  - Crear reportes con fotos
  - Ver lista de reportes
  - Guardar localmente

### 2. 🔄 Módulo de Sincronización
- **Propósito**: Manejar el guardado offline y sincronización
- **Ubicación**: `src/modules/sync/`
- **Archivos principales**:
  - `screens/SyncDashboardScreen.tsx`: Panel de sincronización
  - `services/sqlite.ts`: Manejo de base de datos local
- **Características**:
  - Guardar reportes offline
  - Sincronizar cuando hay conexión
  - Mostrar estado de sincronización

### 3. 👥 Módulo de Administración
- **Propósito**: Gestionar y aprobar reportes
- **Ubicación**: `src/modules/admin/`
- **Archivos principales**:
  - `screens/AdminDashboardScreen.tsx`: Panel de administración
- **Características**:
  - Filtrar reportes
  - Aprobar/rechazar reportes
  - Ver estadísticas

## 🚀 Cómo Empezar

1. **Configuración Inicial**
   ```bash
   npm install
   ```

2. **Ejecutar la App**
   ```bash
   npx expo start --clear
   ```

## 💡 Tips para Desarrollo

1. **Datos Mock**
   - Usar los datos de ejemplo en `src/mocks/`
   - Ayudan a desarrollar sin backend

2. **Tipos TypeScript**
   - Definidos en `src/types/`
   - Usar para consistencia

3. **Servicios**
   - Mock vs Real en `src/services/`
   - Fácil de intercambiar

## 🤝 Trabajo en Equipo

1. **Ramas Git**
   ```bash
   git checkout -b feature/nombre-funcionalidad
   ```

2. **Pruebas**
   - Probar offline y online
   - Verificar sincronización

3. **Comunicación**
   - Documentar cambios
   - Mantener tipos actualizados

## 📘 Recursos

- [Documentación de React Native](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [SQLite en React Native](https://docs.expo.dev/versions/latest/sdk/sqlite/)