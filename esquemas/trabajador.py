from pydantic import BaseModel

class TrabajadorBase(BaseModel):
    nombre: str
    rut: str
    cargo: str | None = None
    area: str | None = None

class TrabajadorCreate(TrabajadorBase):
    pass

class TrabajadorResponse(TrabajadorBase):
    id_trabajador: int
    class Config:
        orm_mode = True
