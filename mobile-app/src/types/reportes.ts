// Tipos básicos para reportes
export interface Reporte {
    id: number;
    titulo: string;
    descripcion: string;
    id_area: number;
    id_severidad: number;
    id_estado_actual: number;
    uuid: string;
    fotos: string[];
    hora_creado: Date;
    hora_sincronizado: Date | null;
    RUT_creador: number; // RUT del trabajador
}

// Tipos para crear un reporte
export interface CreateReportDTO {
    titulo: string;
    descripcion: string;
    fecha_reporte: string; // Formato 'YYYY-MM-DD'
    uuid_cliente: string;
    peticion_idempotencia: string | null;
    id_area: number;
    id_severidad: number;
}

// Tipos para actualizar un reporte
export interface UpdateReportDTO {
    p_nuevo_estado: number;
    p_detalle?: string;
}

// Estado de sincronización
export interface SyncStatus {
    isOnline: boolean;
    lastSync: string | null;
    pendingSyncs: number;
}

// Interfaces para catálogos
export interface Area {
    ID_Area: number;
    Nombre_area: string;
}

export interface Severidad {
    ID_Severidad: number;
    Nombre_severidad: string;
}