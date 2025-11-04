import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JOSEError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from modulos.modelosORM import Usuarios
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #Retorna True si la contraseña coincide con el hash, de lo contrario False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    #Retorna el hash de la contraseña
    return pwd_context.hash(password)

SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("SECRET_KEY no está configurada en las variables de entorno.")


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24 # 1 día

# Crear token de acceso
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    now=datetime.now(timezone.utc)
    # Establecer la expiración del token
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[Usuarios]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"🔍 Validando token: {token[:10]}...")  # Solo mostramos los primeros 10 caracteres
        # Decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"✅ Token decodificado: {payload}")
        rut: int = payload.get("sub")
        if rut is None:
            print("❌ No se encontró 'sub' en el payload")
            raise credentials_exception
        
        print(f"🔎 Buscando usuario con RUT: {rut}")
        # Buscar el usuario en la base de datos
        user = db.query(Usuarios).filter(Usuarios.RUT == rut).first()
        if user is None:
            print("❌ Usuario no encontrado en la base de datos")
            raise credentials_exception
            
        print(f"✅ Usuario encontrado: RUT {user.RUT}")
        return user
    except JOSEError as e:
        print(f"❌ Error decodificando JWT: {str(e)}")
        raise credentials_exception