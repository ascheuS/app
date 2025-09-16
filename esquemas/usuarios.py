from pydantic import BaseModel

class UsuarioBase(BaseModel):
    username: str
    email: str
    role: str | None = None

class UsuarioCreate(UsuarioBase):
    password: str  # Campo obligatorio al crear

class UsuarioResponse(UsuarioBase):
    id_usuario: int

    class Config:
        orm_mode = True
