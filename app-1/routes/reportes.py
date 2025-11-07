# app-1/routes/reportes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from modulos.modelosORM import Areas, Severidad, Estado_reportes
from esquemas.reportes import ReporteCreate, AreaSchema, SeveridadSchema , EstadoReporteSchema
from routes.auth import get_current_user

router = APIRouter(prefix="/reportes", tags=["Reportes"])


# ✅ CATÁLOGOS SIN AUTENTICACIÓN (para sincronización offline)
@router.get('/catalogos/areas', response_model=List[AreaSchema])
async def get_areas(db: Session = Depends(get_db)):
    """
    Obtiene todas las áreas disponibles.
    
    Este endpoint NO requiere autenticación porque se usa para
    sincronizar los catálogos en la base de datos local de la app móvil.
    """
    areas = db.query(Areas).all()
    return areas


@router.get('/catalogos/severidad', response_model=List[SeveridadSchema])
async def get_severidad(db: Session = Depends(get_db)):
    """
    Obtiene todas las severidades disponibles.
    
    Este endpoint NO requiere autenticación porque se usa para
    sincronizar los catálogos en la base de datos local de la app móvil.
    """
    severidades = db.query(Severidad).all()
    return severidades
@router.get('/catalogos/estados', response_model=List[EstadoReporteSchema])
async def get_estados(db: Session = Depends(get_db)):
    # Asegúrate que el modelo se llame 'Estado_reportes'
    estados = db.query(Estado_reportes).all() 
    return estados

# ✅ ENDPOINT PROTEGIDO: Crear reporte (requiere autenticación)
@router.post('/', status_code=status.HTTP_201_CREATED)
async def crear_reporte(
    reporte: ReporteCreate, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Crea un reporte usando el procedimiento almacenado `sp_insertar_reporte`.
    Devuelve el ID del reporte creado.
    
    **Requiere autenticación**: El usuario debe estar logueado.
    """
    try:
        # Llamamos al procedimiento y pedimos que nos devuelva el id via variable de salida
        params = {
            'p_titulo': reporte.titulo,
            'p_descripcion': reporte.descripcion,
            'p_fecha_reporte': reporte.fecha_reporte,
            'p_uuid_cliente': reporte.uuid_cliente,
            'p_rut': current_user.RUT,
            'p_id_severidad': reporte.id_severidad,
            'p_id_area': reporte.id_area,
            'p_id_estado_actual': None,
            'p_peticiones_idempotencia': reporte.peticion_idempotencia,
        }

        # Ejecutar CALL con variable de salida @out_id
        sql_call = text("CALL sp_insertar_reporte(:p_titulo, :p_descripcion, :p_fecha_reporte, :p_uuid_cliente, :p_rut, :p_id_severidad, :p_id_area, :p_id_estado_actual, :p_peticiones_idempotencia, @out_id)")
        db.execute(sql_call, params)
        row = db.execute(text('SELECT @out_id as id')).fetchone()
        id_reporte = row['id'] if row is not None else None
        
        if id_reporte is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail='No se pudo obtener el id del reporte'
            )
        
        db.commit()
        
        return {
            'id_reporte': id_reporte,
            'mensaje': 'Reporte creado exitosamente'
        }
    except Exception as e:
        db.rollback()
        # Si el procedimiento lanzó SIGNAL, el driver puede propagar el mensaje
        msg = str(e)
        
        # Mejorar mensajes de error
        if 'UUID_Cliente ya existe' in msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Ya existe un reporte con este UUID. Posiblemente ya fue sincronizado.'
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=msg
        )   