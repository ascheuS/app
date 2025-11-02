from pydantic import BaseModel


# Schema para crear un usuario (por el admin)
class UserCreate(BaseModel):
    RUT: int
    Nombre: str
    Apellido_1: str
    Apellido_2: str | None = None
    ID_Cargo: int
    ID_Estado_trabajador: int = 1  # Por defecto activo

# Schema para cambiar contraseña
class PasswordChange(BaseModel):
    password: str
    new_password: str

#Lo q la app manda pa hacer login
class UserLogin(BaseModel):
    RUT: int
    password: str
#Lo q el servidor responde al hacer login exitoso
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    RUT: int | None = None
    cargo: int | None = None
# --- Schemas para ver datos del Usuario ---

#Schema BASE: Define los campos comunes de un usuario
class UserBase(BaseModel):
    RUT: int
    Nombre: str
    Apellido_1: str
    Apellido_2: str | None = None
    Cargo: int
    ID_Estado_trabajador: int
    
#Schema de LECTURA: Hereda de UserBase y SÍ puede leer desde el ORM
class User(UserBase):
    class Config:
        from_attributes = True 
