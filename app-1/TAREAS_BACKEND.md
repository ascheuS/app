# 🖥️ Tareas Backend SIGRA

## 📌 Rutas Pendientes por Implementar

### 1. Módulo de Reportes (`routes/reportes.py`)
```python
@router.post("/reportes/")
async def crear_reporte(reporte: ReporteCreate):
    # Crear reporte con UUID del cliente
    # Manejar multimedia
    # Registrar en bitácora

@router.get("/reportes/")
async def listar_reportes():
    # Filtrar por estado, área, fecha
    # Incluir multimedia
    # Paginación

@router.put("/reportes/{id}")
async def actualizar_reporte(id: int):
    # Actualizar estado
    # Registrar en bitácora
    # Manejar idempotencia
```

### 2. Módulo de Sincronización (`routes/sync.py`)
```python
@router.post("/sync/batch")
async def sincronizar_lote():
    # Recibir múltiples reportes
    # Validar UUIDs únicos
    # Manejar conflictos

@router.get("/sync/status")
async def estado_sincronizacion():
    # Verificar últimas actualizaciones
    # Listar pendientes
```

### 3. Módulo de Administración (`routes/admin.py`)
```python
@router.get("/admin/dashboard")
async def dashboard_stats():
    # Estadísticas generales
    # Reportes por estado/área
    # KPIs

@router.post("/admin/reportes/{id}/aprobar")
async def aprobar_reporte(id: int):
    # Cambiar estado
    # Validar permisos
    # Registrar en bitácora
```

## 🛠️ Esquemas a Crear

### 1. Esquemas de Reportes (`esquemas/reportes.py`)
```python
class ReporteCreate(BaseModel):
    titulo: str
    descripcion: str
    area_id: int
    severidad_id: int
    uuid_cliente: str
    multimedia: List[MultimediaCreate]

class ReporteResponse(BaseModel):
    id: int
    titulo: str
    estado: str
    # ... otros campos
```

### 2. Esquemas de Sincronización (`esquemas/sync.py`)
```python
class SyncBatch(BaseModel):
    reportes: List[ReporteCreate]
    device_id: str
    timestamp: datetime

class SyncStatus(BaseModel):
    last_sync: datetime
    pending_count: int
    # ... otros campos
```

## 📝 Modificaciones en Modelos

### 1. Actualizar `modelosORM.py`
- Agregar campos para sincronización
- Agregar índices para mejor rendimiento
- Campos para manejo offline

## 🔒 Seguridad

### 1. Actualizar `crud/security.py`
- Validación de tokens para API móvil
- Permisos por tipo de usuario
- Rate limiting para sincronización

## 🗃️ Base de Datos

### 1. Nuevas Migraciones
```sql
-- Agregar campos para sync
ALTER TABLE Reportes 
ADD COLUMN sync_status VARCHAR(50),
ADD COLUMN last_sync_attempt TIMESTAMP;

-- Índices para búsqueda
CREATE INDEX idx_reportes_estado ON Reportes(ID_Estado_Actual);
CREATE INDEX idx_reportes_fecha ON Reportes(Fecha_Reporte);
```

## 📦 Servicios a Implementar

### 1. Servicio de Archivos
```python
class MultimediaService:
    async def upload_file(file: UploadFile)
    async def get_file_url(file_id: str)
```

### 2. Servicio de Notificaciones
```python
class NotificationService:
    async def notify_status_change(reporte_id: int)
    async def notify_new_report(reporte_id: int)
```

## 🧪 Pruebas a Implementar

### 1. Pruebas de Integración
- Sincronización de reportes
- Flujo de aprobación
- Manejo de conflictos

### 2. Pruebas de Carga
- Sincronización masiva
- Carga de imágenes
- Consultas concurrentes

## 🚀 Despliegue

### 1. Configuración de Producción
- Variables de entorno
- Certificados SSL
- Límites de carga

### 2. Monitoreo
- Logs de sincronización
- Métricas de rendimiento
- Alertas de errores

## 📚 Documentación Pendiente

### 1. API Docs
- Actualizar Swagger/OpenAPI
- Ejemplos de uso
- Guía de migración

### 2. Guías de Desarrollo
- Proceso de sincronización
- Manejo de errores
- Mejores prácticas