from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional

from database import get_db
from modulos.modelosORM import Usuarios
from esquemas.usuarios import Token, UserLogin, UserCreate, PasswordChange, TokenData
from crud.security import verify_password, create_access_token, get_password_hash, SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["Authenticación"])

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuarios:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        rut: Optional[int] = payload.get("rut")
        if rut is None:
            raise credentials_exception
        token_data = TokenData(RUT=rut, cargo=payload.get("cargo"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(Usuarios).filter(Usuarios.RUT == token_data.RUT).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/usuarios", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar si el RUT ya existe
    if db.query(Usuarios).filter(Usuarios.RUT == user.RUT).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El RUT ya está registrado"
        )
    
    # Obtener los últimos 4 dígitos del RUT como contraseña inicial
    initial_password = str(user.RUT)[-4:]
    
    # Crear el nuevo usuario
    db_user = Usuarios(
        RUT=user.RUT,
        Nombre=user.Nombre,
        Apellido_1=user.Apellido_1,
        Apellido_2=user.Apellido_2,
        Contraseña=get_password_hash(initial_password),
        ID_Cargo=user.ID_Cargo,
        ID_Estado_trabajador=user.ID_Estado_trabajador,
        Primer_inicio_sesion=1
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Usuario creado exitosamente"}

@router.post("/cambiar-password", response_model=Token)
async def change_password(
    form_data: PasswordChange,
    current_user: Usuarios = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar la contraseña actual
    if not verify_password(form_data.password, current_user.Contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña actual incorrecta"
        )
    
    # Actualizar la contraseña y marcar que ya no es primer inicio de sesión
    current_user.Contraseña = get_password_hash(form_data.new_password)
    current_user.Primer_inicio_sesion = 0
    db.commit()
    
    # Generar nuevo token
    access_token = create_access_token(
        data={"sub": str(current_user.RUT), "rut": current_user.RUT, "cargo": current_user.ID_Cargo}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin, db: Session = Depends(get_db)):
    # Buscar el usuario por RUT
    usuario = db.query(Usuarios).filter(Usuarios.RUT == form_data.RUT).first()
    if not usuario or not verify_password(form_data.password, usuario.Contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Verificamos si el trabajador está activo
    if usuario.ID_Estado_trabajador != 1:  # Asumiendo que 1 es el estado 'Activo'
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no está activo",
        )
    
    # Si es primer inicio de sesión, devolver estado especial
    if usuario.Primer_inicio_sesion == 1:
        return {
            "access_token": "primer_inicio",
            "token_type": "bearer",
            "require_password_change": True
        }
    
    # Crear el token de acceso
    access_token = create_access_token(
        data={"sub": str(usuario.RUT), "rut": usuario.RUT, "cargo": usuario.ID_Cargo}
    )

    return {"access_token": access_token, "token_type": "bearer"}