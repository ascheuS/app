from sqlalchemy.orm import Session
from modulos.reportes import Reporte
from esquemas.reportes import ReporteCreate

def get_reportes(db: Session):
    return db.query(Reporte).all()

def create_reporte(db: Session, reporte: ReporteCreate):
    db_reporte = Reporte(**reporte.dict())
    db.add(db_reporte)
    db.commit()
    db.refresh(db_reporte)
    return db_reporte
