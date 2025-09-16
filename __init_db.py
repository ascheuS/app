from database import Base, engine
from modulos import trabajador, usuario, reporte  # importa tus modelos

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)
