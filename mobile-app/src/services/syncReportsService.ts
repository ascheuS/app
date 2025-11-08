// mobile-app/src/services/syncReportsService.ts
import { getDB } from '../db/database';
import api from './api';
import * as SecureStore from 'expo-secure-store';

interface ReporteLocal {
  id_local: number;
  Titulo: string;
  Descripcion: string;
  Fecha_Reporte: string;
  UUID_Cliente: string;
  RUT: number;
  ID_Area: number;
  ID_Severidad: number;
  ID_Estado_Actual: number;
  sincronizado: number;
}

/**
 * Sincroniza todos los reportes pendientes con el servidor
 * @returns Número de reportes sincronizados exitosamente
 */
export const sincronizarReportesPendientes = async (): Promise<number> => {
  const db = getDB();
  let reportesSincronizados = 0;

  try {
    console.log('🔄 Iniciando sincronización de reportes...');
    
    // 1. Verificar token
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    // 2. Obtener reportes pendientes (sincronizado = 0)
    const reportesPendientes = await db.getAllAsync<ReporteLocal>(
      'SELECT * FROM Reportes WHERE sincronizado = 0'
    );

    console.log(`📊 Reportes pendientes de sincronizar: ${reportesPendientes.length}`);

    if (reportesPendientes.length === 0) {
      console.log('✅ No hay reportes pendientes de sincronizar');
      return 0;
    }

    // 3. Sincronizar cada reporte
    for (const reporte of reportesPendientes) {
      try {
        console.log(`📤 Sincronizando reporte: ${reporte.Titulo} (UUID: ${reporte.UUID_Cliente})`);
        
        // Preparar datos para el servidor
        const reporteData = {
          titulo: reporte.Titulo,
          descripcion: reporte.Descripcion,
          fecha_reporte: reporte.Fecha_Reporte,
          uuid_cliente: reporte.UUID_Cliente,
          peticion_idempotencia: `mobile-${reporte.UUID_Cliente}`,
          id_severidad: reporte.ID_Severidad,
          id_area: reporte.ID_Area,
        };

        // Enviar al servidor
        const response = await api.post('/reportes/', reporteData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`✅ Reporte sincronizado. ID servidor: ${response.data.id_reporte}`);

        // 4. Actualizar el reporte local con el ID del servidor
        await db.runAsync(
          `UPDATE Reportes 
           SET sincronizado = 1, 
               id_servidor = ?,
               Hora_Actualizado = CURRENT_TIMESTAMP
           WHERE id_local = ?`,
          [response.data.id_reporte, reporte.id_local]
        );

        reportesSincronizados++;

      } catch (error: any) {
        console.error(`❌ Error sincronizando reporte ${reporte.id_local}:`, error.response?.data || error.message);
        
        // Si el error es por UUID duplicado (409), marcar como sincronizado
        if (error.response?.status === 400 && 
            error.response?.data?.detail?.includes('UUID_Cliente ya existe')) {
          console.log(`⚠️ Reporte ya existe en servidor, marcando como sincronizado`);
          await db.runAsync(
            'UPDATE Reportes SET sincronizado = 1 WHERE id_local = ?',
            [reporte.id_local]
          );
          reportesSincronizados++;
        }
        // Continuar con el siguiente reporte en caso de error
      }
    }

    console.log(`✅ Sincronización completada: ${reportesSincronizados}/${reportesPendientes.length} reportes`);
    return reportesSincronizados;

  } catch (error: any) {
    console.error('❌ Error general en sincronización:', error);
    throw error;
  }
};

/**
 * Obtiene el número de reportes pendientes de sincronizar
 */
export const obtenerReportesPendientes = async (): Promise<number> => {
  const db = getDB();
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Reportes WHERE sincronizado = 0'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error obteniendo reportes pendientes:', error);
    return 0;
  }
};

/**
 * Obtiene la fecha de la última sincronización exitosa
 */
export const obtenerUltimaSincronizacion = async (): Promise<Date | null> => {
  const db = getDB();
  try {
    const result = await db.getFirstAsync<{ max_fecha: string }>(
      'SELECT MAX(Hora_Actualizado) as max_fecha FROM Reportes WHERE sincronizado = 1'
    );
    return result?.max_fecha ? new Date(result.max_fecha) : null;
  } catch (error) {
    console.error('Error obteniendo última sincronización:', error);
    return null;
  }
};

/**
 * Verifica si hay conexión a internet intentando un ping al servidor
 */
export const verificarConexion = async (): Promise<boolean> => {
  try {
    const response = await api.get('/', { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    console.log('⚠️ Sin conexión al servidor');
    return false;
  }
};

// ℹ️ NOTA: Los catálogos (Áreas, Severidades, Estados) ahora se manejan
// localmente en database.ts y NO se sincronizan desde el servidor.