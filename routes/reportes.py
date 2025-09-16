from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from esquemas.reportes import ReporteResponse, ReporteCreate
from crud import reportes as crud_reporte

router = APIRouter()

@router.get("/", response_model=list[ReporteResponse])
def listar_reportes(db: Session = Depends(get_db)):
    return crud_reporte.get_reportes(db)

@router.post("/", response_model=ReporteResponse)
def crear_reporte(reporte: ReporteCreate, db: Session = Depends(get_db)):
    return crud_reporte.create_reporte(db, reporte)
