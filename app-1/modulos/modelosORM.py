# app-1/modulos/modelosORM.py
from sqlalchemy import (
    Column, Integer, String, BIGINT, ForeignKey, 
    Date, DateTime, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 
from database import Base

# --- Modelos de Catálogo ---

class Cargos(Base):
    __tablename__ = "Cargos"
    ID_Cargo = Column(Integer, primary_key=True, index=True)
    Nombre_Cargo = Column(String(100), nullable=False)
    
    usuarios = relationship("Usuarios", back_populates="cargo_rel")


class Estado_trabajador(Base):
    __tablename__ = "Estado_trabajador"
    ID_Estado_trabajador = Column(Integer, primary_key=True, index=True)
    Nombre_Estado = Column(String(100), nullable=False)
    
    usuarios = relationship("Usuarios", back_populates="estado_trabajador_rel")


class Areas(Base):
    __tablename__ = "Areas"
    ID_Area = Column(Integer, primary_key=True, index=True)
    # ✅ IMPORTANTE: El nombre debe coincidir EXACTAMENTE con la columna en MySQL
    Nombre_Area = Column(String(255), nullable=False)
    
    reportes = relationship("Reportes", back_populates="area_rel")


class Severidad(Base):
    __tablename__ = "Severidad"
    ID_Severidad = Column(Integer, primary_key=True, index=True)
    # ✅ IMPORTANTE: El nombre debe coincidir EXACTAMENTE con la columna en MySQL
    Nombre_Severidad = Column(String(255), nullable=False)
    
    reportes = relationship("Reportes", back_populates="severidad_rel")


class Estado_reportes(Base):
    __tablename__ = "Estado_reportes"
    ID_Estado_Actual = Column(Integer, primary_key=True, index=True)
    Nombre_Estado = Column(String(255), nullable=False)
    
    reportes = relationship("Reportes", back_populates="estado_actual_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="estado_actual_rel")
    transiciones_desde = relationship("Estado_transicion", foreign_keys="[Estado_transicion.Estado_Desde]")
    transiciones_hacia = relationship("Estado_transicion", foreign_keys="[Estado_transicion.Estado_Hacia]")


# --- Modelos Principales ---

class Usuarios(Base):
    __tablename__ = "Usuarios"
    RUT = Column(BIGINT, primary_key=True, index=True)
    Nombre = Column(String(60), nullable=False)
    Apellido_1 = Column(String(80), nullable=False)
    Apellido_2 = Column(String(80), nullable=True)
    Contraseña = Column(String(255), nullable=False)
    ID_Cargo = Column(Integer, ForeignKey("Cargos.ID_Cargo"), nullable=False)
    ID_Estado_trabajador = Column(Integer, ForeignKey("Estado_trabajador.ID_Estado_trabajador"), nullable=False)
    Primer_inicio_sesion = Column(Integer, nullable=False, default=1)

    cargo_rel = relationship("Cargos", back_populates="usuarios")
    estado_trabajador_rel = relationship("Estado_trabajador", back_populates="usuarios")
    reportes = relationship("Reportes", back_populates="usuario_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="usuario_rel")


class Reportes(Base):
    __tablename__ = "Reportes"
    ID_Reporte = Column(Integer, primary_key=True, autoincrement=True)
    Titulo = Column(String(255), nullable=False)
    Descripcion = Column(Text, nullable=True)
    Fecha_Reporte = Column(Date, nullable=True)
    UUID_Cliente = Column(String(36), nullable=True)
    Hora_Creado = Column(DateTime, nullable=False, server_default=func.now())
    Hora_Sincronizado = Column(DateTime, nullable=True)
    Hora_Actualizado = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    Peticiones_Idempotencia = Column(String(255), nullable=True)

    # Llaves Foráneas
    RUT = Column(BIGINT, ForeignKey("Usuarios.RUT"), nullable=True)
    ID_Severidad = Column(Integer, ForeignKey("Severidad.ID_Severidad"), nullable=True)
    ID_Area = Column(Integer, ForeignKey("Areas.ID_Area"), nullable=True)
    ID_Estado_Actual = Column(Integer, ForeignKey("Estado_reportes.ID_Estado_Actual"), nullable=True)

    # Relaciones
    usuario_rel = relationship("Usuarios", back_populates="reportes")
    severidad_rel = relationship("Severidad", back_populates="reportes")
    area_rel = relationship("Areas", back_populates="reportes")
    estado_actual_rel = relationship("Estado_reportes", back_populates="reportes")
    multimedia = relationship("Multimedia_reportes", back_populates="reporte_rel")
    bitacoras = relationship("Bitacora_reportes", back_populates="reporte_rel")


class Multimedia_reportes(Base):
    __tablename__ = "Multimedia_reportes"
    ID_Multimedia = Column(Integer, primary_key=True, autoincrement=True)
    Tipo_Multimedia = Column(String(100), nullable=True)
    ruta = Column(String(1024), nullable=False)
    ID_Reporte = Column(Integer, ForeignKey("Reportes.ID_Reporte"), nullable=True)
    
    reporte_rel = relationship("Reportes", back_populates="multimedia")


class Bitacora_reportes(Base):
    __tablename__ = "Bitacora_reportes"
    ID_Bitacora = Column(Integer, primary_key=True, autoincrement=True)
    Nombre_Administrador = Column(String(255), nullable=True)
    Detalle = Column(Text, nullable=True)
    Actualizacion_Fecha = Column(DateTime, nullable=False, server_default=func.now())
    
    # Llaves Foráneas
    ID_Estado_Actual = Column(Integer, ForeignKey("Estado_reportes.ID_Estado_Actual"), nullable=True)
    ID_Reporte = Column(Integer, ForeignKey("Reportes.ID_Reporte"), nullable=True)
    RUT = Column(BIGINT, ForeignKey("Usuarios.RUT"), nullable=True)

    # Relaciones
    estado_actual_rel = relationship("Estado_reportes", back_populates="bitacoras")
    reporte_rel = relationship("Reportes", back_populates="bitacoras")
    usuario_rel = relationship("Usuarios", back_populates="bitacoras")


class Estado_transicion(Base):
    __tablename__ = "Estado_transicion"
    ID_Transicion = Column(Integer, primary_key=True, autoincrement=True)
    Estado_Desde = Column(Integer, ForeignKey("Estado_reportes.ID_Estado_Actual"), nullable=True)
    Estado_Hacia = Column(Integer, ForeignKey("Estado_reportes.ID_Estado_Actual"), nullable=True)