from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from modulos.modelosORM import Usuarios
from esquemas.usuarios import Token, UserLogin
from crud.security import verify_password, create_access_token

router=APIRouter(prefix="/auth", tags=["Authenticación"])

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin,db:Session=Depends(get_db)):
    #Buscar el usuario por RUT
    usuario=db.query(Usuarios).filter(Usuarios.RUT==form_data.RUT).first()
    if not usuario or not verify_password(form_data.password, usuario.Contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #Verificamos si el trabajador está activo
    if usuario.ID_Estado_trabajador != 1:  # Asumiendo que 1 es el estado 'Activo'
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no está activo",
        )
    
    #Crear el token de acceso
    access_token = create_access_token(
        data={"sub": str(usuario.RUT),"rut":usuario.RUT ,"cargo": usuario.ID_Cargo}
    )

    return {"access_token": access_token, "token_type": "bearer"}