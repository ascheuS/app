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
# --- Schema para MOSTRAR un Reporte ---
# Esto es lo que el servidor devuelve a la App
class Reporte(BaseModel):
    id_reporte: int
    titulo: str
    descripcion: str | None = None
    fecha_reporte: date
    hora_creado: datetime
    hora_sincronizado: datetime | None = None
    rut: int
    id_severidad: int
    id_area: int
    id_estado_actual: int

    class Config:
        orm_mode = True
