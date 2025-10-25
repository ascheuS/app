from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 1. ESTA ES LA LÍNEA QUE DEBES CAMBIAR
# Apunta directamente a tu base de datos MySQL de reportes_mineria.
DATABASE_URL = "mysql+pymysql://miner_user:gogeta2003@localhost:3307/reportes_mineria"


# El 'connect_args' es solo para SQLite, ya no lo necesitas.
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

