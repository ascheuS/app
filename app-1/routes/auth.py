from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional

from database import get_db
from modulos.modelosORM import Usuarios
from esquemas.usuarios import Token, UserLogin, UserCreate, PasswordChange, TokenData, User, UserStateUpdate
from crud.security import verify_password, create_access_token, get_password_hash, SECRET_KEY, ALGORITHM
from typing import List

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


@router.get("/usuarios", response_model=List[User])
async def list_users(current_user: Usuarios = Depends(get_current_user), db: Session = Depends(get_db)):
    # Solo administradores (ID_Cargo == 1) pueden listar usuarios
    if current_user.ID_Cargo != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    users = db.query(Usuarios).all()
    return users


@router.patch("/usuarios/{rut}/estado", response_model=User)
async def update_user_state(rut: int, state: UserStateUpdate, current_user: Usuarios = Depends(get_current_user), db: Session = Depends(get_db)):
    # Solo administradores pueden actualizar estado
    if current_user.ID_Cargo != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    usuario = db.query(Usuarios).filter(Usuarios.RUT == rut).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    usuario.ID_Estado_trabajador = state.ID_Estado_trabajador
    db.commit()
    db.refresh(usuario)
    return usuario

@router.post("/cambiar-password", response_model=Token)
async def change_password(
    request: Request,
    form_data: PasswordChange,
    db: Session = Depends(get_db)
):
    """
    Permite cambiar la contraseña.
    - Si se proporciona un Authorization header con un JWT válido, se usa ese usuario.
    - Si no hay Authorization válido y se provee `RUT` en el body, se usará ese RUT
      únicamente si el usuario está marcado como `Primer_inicio_sesion == 1`.
    Esto permite el flujo de primer inicio donde el backend devolvió el marcador
    "primer_inicio" en vez de un JWT.
    """
    # Intentar extraer token del header (si existe)
    auth_header = request.headers.get('authorization')
    usuario = None

    if auth_header and auth_header.lower().startswith('bearer '):
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            rut: Optional[int] = payload.get("rut")
            if rut is not None:
                usuario = db.query(Usuarios).filter(Usuarios.RUT == rut).first()
        except JWTError:
            usuario = None

    # Si no se obtuvo usuario por token, intentar por RUT en el body (solo primer inicio)
    if usuario is None:
        if form_data.RUT is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo validar las credenciales")
        usuario = db.query(Usuarios).filter(Usuarios.RUT == form_data.RUT).first()
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        # Permitir cambio sin token solo si es primer inicio de sesión
        if usuario.Primer_inicio_sesion != 1:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Operación no permitida sin autenticación completa")

    # Verificar la contraseña actual
    if not verify_password(form_data.password, usuario.Contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña actual incorrecta"
        )

    # Actualizar la contraseña y marcar que ya no es primer inicio de sesión
    usuario.Contraseña = get_password_hash(form_data.new_password)
    usuario.Primer_inicio_sesion = 0
    db.commit()
    db.refresh(usuario)

    # Generar nuevo token
    access_token = create_access_token(
        data={"sub": str(usuario.RUT), "rut": usuario.RUT, "cargo": usuario.ID_Cargo}
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


@router.get('/me', response_model=User)
async def read_current_user(current_user: Usuarios = Depends(get_current_user)):
    # Devuelve la información del usuario actual
    return current_user