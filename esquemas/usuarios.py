from pydantic import BaseModel


#Lo q la app manda pa hacer login
class UserLogin(BaseModel):
    rut: int
    password: str
#Lo q el servidor responde al hacer login exitoso
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    rut: int | None = None
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
        orm_mode = True 
