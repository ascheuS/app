from pydantic import BaseModel
from datetime import date, datetime

# --- Schema para CREAR un Reporte ---
# Esto es lo que la App (React Native) envía al servidor
class ReporteCreate(BaseModel):
    titulo: str
    descripcion: str | None = None
    fecha_reporte: date
    uuid_cliente: str
    peticion_idempotencia: str | None = None
    id_severidad: int
    id_area: int
# --- Schemas para Catálogos ---
class AreaSchema(BaseModel):
    ID_Area: int
    Nombre_area: str
    Descripcion: str | None = None

    class Config:
        from_attributes = True

class SeveridadSchema(BaseModel):
    ID_Severidad: int
    Nombre_severidad: str
    Descripcion: str | None = None

    class Config:
        from_attributes = True

# --- Schema para MOSTRAR un Reporte ---
# Esto es lo que el servidor devuelve a la App
class Reporte(BaseModel):
    id_reporte: int
    titulo: str
    descripcion: str | None = None
    fecha_reporte: date
    hora_creado: datetime
    hora_sincronizado: datetime | None = None
    RUT: int
    id_severidad: int
    id_area: int
    id_estado_actual: int

    class Config:
        from_attributes = True
