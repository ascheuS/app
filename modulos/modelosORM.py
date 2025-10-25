from sqlalchemy import (
    Column, Integer, String, BIGINT, ForeignKey, 
    Date, DateTime, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 
from database import Base

# --- Modelos de Catálogo (Los que no dependen de otros) ---

class Cargo(Base):
    __tablename__ = "Cargos"
    ID_Cargo = Column(Integer, primary_key=True, index=True)
    Nombre_cargo = Column(String(100), nullable=False)
    
    # Relación inversa: Un cargo puede tener muchos usuarios
    usuarios = relationship("Usuario", back_populates="cargo_rel")

class Estado_trabajador(Base):
    __tablename__ = "Estado_trabajador"
    ID_Estado_trabajador = Column(Integer, primary_key=True, index=True)
    Nombre_estado_trabajador = Column(String(100), nullable=False)
    
    # Relación inversa: Un estado puede tener muchos usuarios
    usuarios = relationship("Usuario", back_populates="estado_trabajador_rel")

class Areas(Base):
    __tablename__ = "Areas"
    ID_Area = Column(Integer, primary_key=True, index=True)
    Nombre_area = Column(String(100), nullable=False)
    
    # Relación inversa
    reportes = relationship("Reportes", back_populates="area_rel")

class Severidad(Base):
    __tablename__ = "Severidad"
    ID_Severidad = Column(Integer, primary_key=True, index=True)
    Nombre_severidad = Column(String(100), nullable=False)
    
    # Relación inversa
    reportes = relationship("Reportes", back_populates="severidad_rel")

class Estados_reportes(Base):
    __tablename__ = "Estados_reportes"
    ID_Estado_Actual = Column(Integer, primary_key=True, index=True)
    Nombre_estado = Column(String(100), nullable=False)
    
    # Relaciones inversas
    reportes = relationship("Reportes", back_populates="estado_actual_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="estado_actual_rel")
    # Para Estado_transicion (más complejo, pero así se hace)
    transiciones_desde = relationship("Estado_transicion", foreign_keys="[Estado_transicion.Estado_Desde]")
    transiciones_hacia = relationship("Estado_transicion", foreign_keys="[Estado_transicion.Estado_Hacia]")

# --- Modelos Principales (Los que dependen de otros) ---

class Usuario(Base):
    __tablename__ = "Usuarios"
    RUT = Column(BIGINT, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Apellido_1 = Column(String(100), nullable=False)
    Apellido_2 = Column(String(100), nullable=True)
    Hashed_password = Column(String(255), nullable=False)
    Cargo = Column(Integer, ForeignKey("Cargos.ID_Cargo"), nullable=False)
    ID_Estado_trabajador = Column(Integer, ForeignKey("Estado_trabajador.ID_Estado_trabajador"), nullable=False)

    # --- Relaciones ---
    cargo_rel = relationship("Cargo", back_populates="usuarios")
    estado_trabajador_rel = relationship("Estado_trabajador", back_populates="usuarios")
    
    # Relaciones inversas
    reportes = relationship("Reportes", back_populates="usuario_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="usuario_rel")

class Reportes(Base):
    __tablename__ = "Reportes"
    ID_Reporte = Column(Integer, primary_key=True, autoincrement=True)
    Titulo = Column(String(200), nullable=False)
    Descripcion = Column(Text, nullable=False)
    UUID_Cliente = Column(String(100), nullable=False, unique=True)
    Hora_Creacdo = Column(DateTime, nullable=False, server_default=func.now())
    Hora_Sincronizado = Column(DateTime, nullable=True)
    Hora_Actualizado = Column(DateTime, nullable=True, onupdate=func.now())
    Peticion_Idempotencia = Column(String(100), nullable=True)

    # --- Llaves Foráneas ---
    RUT = Column(BIGINT, ForeignKey("Usuarios.RUT"))
    ID_Severidad = Column(Integer, ForeignKey("Severidad.ID_Severidad"))
    ID_Area = Column(Integer, ForeignKey("Areas.ID_Area"))
    ID_Estado_Actual = Column(Integer, ForeignKey("Estados_reportes.ID_Estado_Actual"))

    # --- Relaciones ---
    usuario_rel = relationship("Usuario", back_populates="reportes")
    severidad_rel = relationship("Severidad", back_populates="reportes")
    area_rel = relationship("Areas", back_populates="reportes")
    estado_actual_rel = relationship("Estados_reportes", back_populates="reportes")
    
    # Relaciones inversas
    multimedia = relationship("Multimedia_reportes", back_populates="reporte_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="reporte_rel")

class Multimedia_reportes(Base):
    __tablename__ = "Multimedia_reportes"
    ID_Multimedia = Column(Integer, primary_key=True, autoincrement=True)
    Tipo_Multimedia = Column(String(50), nullable=False)
    ruta=Column(String(1024), nullable=False)
    ID_Reporte = Column(Integer, ForeignKey("Reportes.ID_Reporte"))
    
    # --- Relaciones ---
    reporte_rel = relationship("Reportes", back_populates="multimedia")

class Bitacora_reportes(Base):
    __tablename__ = "Bitacora_reportes"
    ID_Bitacora = Column(Integer, primary_key=True, autoincrement=True)
    Nombre_Administrador = Column(String(200), nullable=False) 
    Detalle = Column(Text, nullable=False) 
    Actualizacion_fecha = Column(DateTime, nullable=False, server_default=func.now())
    
    # --- Llaves Foráneas ---
    ID_Estado_Actual = Column(Integer, ForeignKey("Estados_reportes.ID_Estado_Actual"))
    ID_Reporte = Column(Integer, ForeignKey("Reportes.ID_Reporte"))
    RUT = Column(BIGINT, ForeignKey("Usuarios.RUT"))

    # --- Relaciones ---
    estado_actual_rel = relationship("Estados_reportes", back_populates="bitacoras")
    reporte_rel = relationship("Reportes", back_populates="bitacoras")
    usuario_rel = relationship("Usuario", back_populates="bitacoras")

class Estado_transicion(Base):
    __tablename__ = "Estado_transicion"
    ID_Transicion = Column(Integer, primary_key=True, autoincrement=True)
    Estado_Desde = Column(Integer, ForeignKey("Estados_reportes.ID_Estado_Actual"))
    Estado_Hacia = Column(Integer, ForeignKey("Estados_reportes.ID_Estado_Actual"))
    
    # (Estas relaciones son más avanzadas, pero útiles si las necesitas)
    # estado_desde_rel = relationship("Estados_reportes", foreign_keys=[Estado_Desde])
    # estado_hacia_rel = relationship("Estados_reportes", foreign_keys=[Estado_Hacia])