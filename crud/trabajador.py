from sqlalchemy.orm import Session
from modulos.trabajador import Trabajador
from esquemas.trabajador import TrabajadorCreate

def get_trabajadores(db: Session):
    return db.query(Trabajador).all()

def create_trabajador(db: Session, trabajador: TrabajadorCreate):
    db_trabajador = Trabajador(**trabajador.dict())
    db.add(db_trabajador)
    db.commit()
    db.refresh(db_trabajador)
    return db_trabajador
