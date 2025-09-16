from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from esquemas.usuarios import UsuarioResponse, UsuarioCreate
from crud import usuarios as crud_usuario

router = APIRouter()

@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return crud_usuario.get_usuarios(db)

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return crud_usuario.create_usuario(db, usuario)
