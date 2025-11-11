# app-1/routes/reportes.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from modulos.modelosORM import Areas, Severidad, Estado_reportes, Usuarios
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
    try:
        print("Datos recibidos para crear reporte:", reporte.dict())    
        rut_a_usar= reporte.rut or current_user.RUT
        id_estado_actual= reporte.id_estado_actual or 1  # Asignar un estado por defecto si no se proporciona
        params = {
            'p_titulo': reporte.titulo,
            'p_descripcion': reporte.descripcion,
            'p_fecha_reporte': reporte.fecha_reporte,
            'p_uuid_cliente': reporte.uuid_cliente,
            'p_rut': rut_a_usar,
            'p_id_severidad': reporte.id_severidad,
            'p_id_area': reporte.id_area,
            'p_id_estado_actual': id_estado_actual,
            'p_peticiones_idempotencia': reporte.peticion_idempotencia,
        }

        print("Parámetros para el procedimiento almacenado:", params)

        sql_call = text("CALL sp_insertar_reporte(:p_titulo, :p_descripcion, :p_fecha_reporte, :p_uuid_cliente, :p_rut, :p_id_severidad, :p_id_area, :p_id_estado_actual, :p_peticiones_idempotencia, @out_id)")
        db.execute(sql_call, params)
        
        # Cambio aquí: usar .mappings() para obtener un diccionario
        row = db.execute(text('SELECT @out_id as id')).mappings().fetchone()
        
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail='No se pudo obtener el id del reporte'
            )
        
        id_reporte = row['id']
        
        db.commit()
        
        return {
            'id_reporte': id_reporte,
            'mensaje': 'Reporte creado exitosamente'
        }
    except Exception as e:
        db.rollback()
        msg = str(e)
        
        if 'UUID_Cliente ya existe' in msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Ya existe un reporte con este UUID. Posiblemente ya fue sincronizado.'
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=msg
        )

#ENDPOINT para obtener lista de todos los reportes
@router.get('/', response_model=List[dict])
async def listar_reportes(
    current_user: Usuarios = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista todos los reportes (solo para administradores)
    """
    # Solo administradores pueden ver todos los reportes
    if current_user.ID_Cargo != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    try:
        # Consulta con JOINs para obtener nombres
        query = text("""
            SELECT 
                r.ID_Reporte,
                r.Titulo,
                r.Descripcion,
                r.Fecha_Reporte,
                r.Hora_Creado,
                r.Hora_Sincronizado,
                r.RUT,
                r.ID_Severidad,
                r.ID_Area,
                r.ID_Estado_Actual,
                a.Nombre_Area,
                s.Nombre_Severidad,
                e.Nombre_Estado,
                CONCAT(u.Nombre, ' ', u.Apellido_1) as Nombre_Usuario
            FROM Reportes r
            LEFT JOIN Areas a ON r.ID_Area = a.ID_Area
            LEFT JOIN Severidad s ON r.ID_Severidad = s.ID_Severidad
            LEFT JOIN Estado_reportes e ON r.ID_Estado_Actual = e.ID_Estado_Actual
            LEFT JOIN Usuarios u ON r.RUT = u.RUT
            ORDER BY r.Hora_Creado DESC
        """)
        
        result = db.execute(query)
        reportes = result.fetchall()
        
        # Convertir a lista de diccionarios
        reportes_list = []
        for row in reportes:
            reportes_list.append({
                'ID_Reporte': row.ID_Reporte,
                'Titulo': row.Titulo,
                'Descripcion': row.Descripcion,
                'Fecha_Reporte': str(row.Fecha_Reporte) if row.Fecha_Reporte else None,
                'Hora_Creado': str(row.Hora_Creado),
                'Hora_Sincronizado': str(row.Hora_Sincronizado) if row.Hora_Sincronizado else None,
                'RUT': row.RUT,
                'ID_Area': row.ID_Area,
                'Nombre_Area': row.Nombre_Area,
                'ID_Severidad': row.ID_Severidad,
                'Nombre_Severidad': row.Nombre_Severidad,
                'ID_Estado_Actual': row.ID_Estado_Actual,
                'Nombre_Estado': row.Nombre_Estado,
                'Nombre_Usuario': row.Nombre_Usuario
            })
        
        return reportes_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Error al obtener reportes: {str(e)}'
        )
    
@router.get('/{reporte_id}', response_model=dict)
async def obtener_reporte(
    reporte_id: int,
    current_user: Usuarios = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene un reporte específico por su ID.
    """
    try:
        query = text("""
            SELECT 
                r.ID_Reporte,
                r.Titulo,
                r.Descripcion,
                r.Fecha_Reporte,
                r.Hora_Creado,
                r.Hora_Sincronizado,
                r.RUT,
                r.ID_Severidad,
                r.ID_Area,
                r.ID_Estado_Actual,
                a.Nombre_Area,
                s.Nombre_Severidad,
                e.Nombre_Estado,
                CONCAT(u.Nombre, ' ', u.Apellido_1) as Nombre_Usuario
            FROM Reportes r
            LEFT JOIN Areas a ON r.ID_Area = a.ID_Area
            LEFT JOIN Severidad s ON r.ID_Severidad = s.ID_Severidad
            LEFT JOIN Estado_reportes e ON r.ID_Estado_Actual = e.ID_Estado_Actual
            LEFT JOIN Usuarios u ON r.RUT = u.RUT
            WHERE r.ID_Reporte = :report_id
        """)
        
        result = db.execute(query, {"report_id": reporte_id})
        row = result.mappings().first()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Reporte no encontrado'
            )
        
        # Verificar permisos: trabajadores solo ven sus reportes
        if current_user.ID_Cargo != 1 and row.RUT != current_user.RUT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para ver este reporte'
            )
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Error al obtener reporte: {str(e)}'
        )  
#ENDPOINT para editar el estado del reporte
@router.put('/{reporte_id}/estado', status_code=status.HTTP_200_OK)
async def actualizar_estado_reporte(
    reporte_id: int,
    nuevo_estado_id: int=Body(...),
    detalle :  Optional[str] = Body(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):  
        if(current_user.ID_Cargo != 1):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No autorizado. Solo administradores pueden cambiar el estado del reporte."
            )
        try:
            print(f"Actualizando estado del reporte {reporte_id} al nuevo estado {nuevo_estado_id}")
            nombre_adminn= current_user.Nombre + " " + current_user.Apellido_1+ " " + current_user.Apellido_2
            print(f"Usuario que realiza el cambio: {nombre_adminn} (RUT: {current_user.RUT})")
            params = {
                'p_reporte_id': reporte_id,
                'p_nuevo_estado_id': nuevo_estado_id,
                'p_nombre_administrador': nombre_adminn,
                'p_detalle': detalle,
                'p_usuario_rut': current_user.RUT 
            }
            
            sql_call = text("CALL sp_cambiar_estado_reporte(:p_reporte_id, :p_nuevo_estado_id, :p_nombre_administrador, :p_detalle ,:p_usuario_rut)")
            db.execute(sql_call, params)
            db.commit()
            
            return {
                'mensaje': 'Estado del reporte actualizado exitosamente'
            }
        except Exception as e:
            db.rollback()
            msg = str(e)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=msg
            )   