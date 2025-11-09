# app-1/esquemas/reportes.py
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

# --- Schema para CREAR un Reporte ---
class ReporteCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_reporte: date
    uuid_cliente: str
    peticion_idempotencia: Optional[str] = None
    id_severidad: int
    id_area: int
    id_estado_actual: Optional[int] = None
    rut: Optional[int] = None


# --- Schemas para Catálogos ---
class AreaSchema(BaseModel):
    ID_Area: int
    Nombre_Area: str  # ✅ Corregido (era Nombre_area con 'a' minúscula)

    class Config:
        from_attributes = True


class SeveridadSchema(BaseModel):
    ID_Severidad: int
    Nombre_Severidad: str  # ✅ Corregido (era Nombre_severidad con 's' minúscula)

class EstadoReporteSchema(BaseModel):
    ID_Estado_Actual: int
    Nombre_Estado: str

    class Config:
        from_attributes = True


# --- Schema para MOSTRAR un Reporte ---
class Reporte(BaseModel):
    ID_Reporte: int
    Titulo: str
    Descripcion: Optional[str] = None
    Fecha_Reporte: date
    Hora_Creado: datetime  # ✅ Corregido el typo
    Hora_Sincronizado: Optional[datetime] = None
    RUT: int
    ID_Severidad: int
    ID_Area: int
    ID_Estado_Actual: int

    class Config:
        from_attributes = True