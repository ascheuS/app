from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from modulos.modelosORM import Reportes
from esquemas.reportes import ReporteCreate, Reporte as ReporteSchema
from crud.security import get_current_user
from esquemas.usuarios import User

router = APIRouter(prefix="/reportes", tags=["Reportes"])
@router.post("/", response_model=ReporteSchema)
async def crear_reporte(reporte: ReporteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    nuevo_reporte = Reportes(
        Titulo=reporte.Titulo,
        Descripcion=reporte.Descripcion,
        Fecha_Creacion=reporte.Fecha_Creacion,
        ID_Usuario=current_user.RUT
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    return nuevo_reporte

@router.get("/{id_reporte}", response_model=ReporteSchema)
async def obtener_reporte(id_reporte: int, db: Session = Depends(get_db)):
    reporte = db.query(Reportes).filter(Reportes.ID_Reporte == id_reporte).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return reporte