from sqlalchemy import Column, Integer, String
from database import Base

class Trabajador(Base):
    __tablename__ = "trabajadores"
    id_trabajador = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    cargo = Column(String(50))
    area = Column(String(50))

