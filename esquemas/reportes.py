from pydantic import BaseModel
from datetime import datetime

class ReporteBase(BaseModel):
    titulo: str
    descripcion: str | None = None
    trabajador_id: int

class ReporteCreate(ReporteBase):
    pass

class ReporteResponse(ReporteBase):
    id_reporte: int
    fecha_reporte: datetime

    class Config:
        orm_mode = True
