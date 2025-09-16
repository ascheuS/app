from fastapi import FastAPI
from routes import trabajadores, usuarios, reportes  # Importamos los routers

app = FastAPI(
    title="SIGRA - Sistema de Reportes de Seguridad",
    description="API para gestionar trabajadores, usuarios y reportes de seguridad minera",
    version="1.0.0"
)

# Incluimos los routers con prefijo y tags (ayuda en la documentación /docs)
app.include_router(trabajadores.router, prefix="/trabajadores", tags=["Trabajadores"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])

# Ruta base de prueba
@app.get("/")
def root():
    return {"message": "Bienvenido al API de SIGRA"}

