import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JOSEError
from datetime import datetime, timedelta , timezone

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