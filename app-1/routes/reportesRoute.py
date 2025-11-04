from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from modulos.modelosORM import Reportes, Areas, Severidad
from esquemas.reportes import ReporteCreate, Reporte as ReporteSchema, AreaSchema, SeveridadSchema
from crud.security import get_current_user
from esquemas.usuarios import User
from typing import List

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.get("/catalogos/areas", response_model=List[AreaSchema])
async def obtener_areas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    areas = db.query(Areas).all()
    if not areas:
        raise HTTPException(status_code=404, detail="No se encontraron áreas")
    return areas

@router.get("/catalogos/severidad", response_model=List[SeveridadSchema])
async def obtener_severidades(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    severidades = db.query(Severidad).all()
    if not severidades:
        raise HTTPException(status_code=404, detail="No se encontraron severidades")
    return severidades

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