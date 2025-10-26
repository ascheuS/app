# Imagen base
FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requisitos antes que el código, para aprovechar el cacheo
COPY requerimientos.txt .  

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requerimientos.txt

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que FastAPI se ejecutará
EXPOSE 8000

# Comando para arrancar FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

