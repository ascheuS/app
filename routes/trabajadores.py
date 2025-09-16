from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from esquemas.trabajador import TrabajadorResponse, TrabajadorCreate
from crud import trabajador as crud_trabajador

router = APIRouter()

@router.get("/", response_model=list[TrabajadorResponse])
def listar_trabajadores(db: Session = Depends(get_db)):
    return crud_trabajador.get_trabajadores(db)

@router.post("/", response_model=TrabajadorResponse)
def crear_trabajador(trabajador: TrabajadorCreate, db: Session = Depends(get_db)):
    return crud_trabajador.create_trabajador(db, trabajador)
