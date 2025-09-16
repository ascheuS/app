from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Reporte(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), nullable=False)
    descripcion = Column(String(250))
    trabajador_id = Column(Integer, ForeignKey("trabajadores.id"))
    fecha_reporte = Column(DateTime, default=datetime.utcnow)

    trabajador = relationship("Trabajador")
