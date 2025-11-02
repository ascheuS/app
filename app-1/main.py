from fastapi import FastAPI
from dotenv import load_dotenv  # <-- 1. IMPORTA load_dotenv

# 2. LLAMA a la función INMEDIATAMENTE
# Esto carga todas las variables de tu .env
load_dotenv()

# 3. AHORA SÍ, importa el resto de tus módulos
# (Porque ahora la SECRET_KEY ya existe en el entorno)
from routes import auth
from routes import reportes
from database import engine, Base

# Crear las tablas en la base de datos (si no existen) da Problemas
#Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SIGRA API",
    description="API para el sistema de gestion reportes de seguridad minera",
    version="1.0.0"
)

# Incluimos los routers
app.include_router(auth.router)
app.include_router(reportes.router)

# Ruta base de prueba
@app.get("/")
def root():
    return {"message": "Bienvenido al API de SIGRA"}