# 📋 Guía de Implementación de Módulos SIGRA

## 🔄 Módulo de Sincronización

### Paso 1: Configuración de SQLite
1. Instalar dependencias:
   ```bash
   npx expo install expo-sqlite
   ```
2. Crear archivo `src/modules/sync/services/sqlite.ts`:
   - Implementar función de inicialización de base de datos
   - Crear tabla para reportes
   - Crear tabla para cola de sincronización

### Paso 2: Servicio de Sincronización
1. Crear `src/modules/sync/services/syncService.ts`:
   ```typescript
   interface SyncService {
     pushPendingReports(): Promise<void>;
     pullNewReports(): Promise<void>;
     getSyncStatus(): Promise<SyncStatus>;
   }
   ```
2. Implementar lógica para:
   - Detectar estado de conexión
   - Encolar reportes offline
   - Sincronizar cuando hay conexión

### Paso 3: Panel de Sincronización
1. Crear `src/modules/sync/screens/SyncDashboardScreen.tsx`:
   - Mostrar estado de conexión
   - Listar reportes pendientes de sincronización
   - Botón de sincronización manual
   - Indicador de última sincronización

### Paso 4: Integración con Reportes
1. Modificar servicio de reportes para:
   - Guardar localmente primero
   - Marcar estado de sincronización
   - Intentar sincronizar automáticamente

### Paso 5: Pruebas
1. Escenarios a probar:
   - Crear reporte sin conexión
   - Sincronizar al recuperar conexión
   - Manejar conflictos de sincronización
   - Validar integridad de datos

## 👥 Módulo de Administración

### Paso 1: Autenticación de Administrador
1. Crear `src/modules/admin/services/authService.ts`:
   - Implementar login de administrador
   - Manejar tokens JWT
   - Guardar sesión localmente

### Paso 2: Panel de Control
1. Crear `src/modules/admin/screens/AdminDashboardScreen.tsx`:
   ```typescript
   interface AdminStats {
     totalReports: number;
     pendingApproval: number;
     approvedToday: number;
   }
   ```
2. Implementar:
   - Resumen de estadísticas
   - Gráficos de reportes por estado
   - Filtros por fecha y área

### Paso 3: Lista de Reportes
1. Crear `src/modules/admin/screens/ReportManagementScreen.tsx`:
   - Tabla de reportes con filtros
   - Acciones rápidas (aprobar/rechazar)
   - Ordenamiento por diferentes campos

### Paso 4: Detalles y Aprobación
1. Crear `src/modules/admin/screens/ReportDetailScreen.tsx`:
   - Vista detallada del reporte
   - Formulario de aprobación/rechazo
   - Historial de cambios
   - Visualización de fotos

### Paso 5: Reportes y Estadísticas
1. Crear `src/modules/admin/screens/StatisticsScreen.tsx`:
   - Gráficos por área
   - Tendencias temporales
   - Exportación de datos
   - KPIs principales

## 🔧 Herramientas y Utilidades Compartidas

### Componentes Comunes
1. Crear en `src/components/`:
   - `LoadingOverlay.tsx`
   - `ErrorBoundary.tsx`
   - `ConfirmationDialog.tsx`
   - `PhotoViewer.tsx`

### Utilidades
1. Crear en `src/utils/`:
   - `dateFormatter.ts`
   - `validators.ts`
   - `errorHandlers.ts`

### Tipos Compartidos
1. Actualizar en `src/types/`:
   ```typescript
   interface AdminUser {
     id: number;
     username: string;
     role: 'admin' | 'supervisor';
   }

   interface SyncQueue {
     id: string;
     reportId: string;
     action: 'create' | 'update';
     timestamp: string;
     retries: number;
   }
   ```

## 📱 Flujos de Usuario

### Flujo de Sincronización
1. Usuario crea reporte offline
2. App guarda en SQLite
3. Al detectar conexión:
   - Intenta sincronizar
   - Actualiza estado
   - Notifica resultado

### Flujo de Administración
1. Admin inicia sesión
2. Ve dashboard con estadísticas
3. Revisa reportes pendientes
4. Aprueba/rechaza con comentarios
5. Genera reportes según necesidad

## 🧪 Plan de Pruebas

### Pruebas de Sincronización
- [ ] Crear reporte offline
- [ ] Sincronizar al recuperar conexión
- [ ] Manejar errores de red
- [ ] Verificar integridad de datos

### Pruebas de Administración
- [ ] Login/logout
- [ ] CRUD de reportes
- [ ] Filtros y búsquedas
- [ ] Generación de reportes

## 📚 Recursos Útiles

- [Documentación SQLite Expo](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [FastAPI Backend Docs](http://your-backend-url/docs)
- [React Native Charts](https://github.com/JesperLekland/react-native-svg-charts)
- [Async Storage](https://react-native-async-storage.github.io/async-storage/)