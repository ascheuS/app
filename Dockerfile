# Imagen base
FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos requirements.txt primero (para cacheo de dependencias)
COPY requerimientos.txt .

# Instalamos dependencias
RUN pip install --no-cache-dir -r requerimientos.txt

# Copiamos el resto del código
COPY . .

# Comando para arrancar FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
