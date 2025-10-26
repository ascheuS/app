// Tipos básicos para reportes
export interface Report {
    id: string;
    title: string;
    description: string;
    area: string;
    severity: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'rejected';
    photos: string[];
    createdAt: string;
    isSync: boolean;
    createdBy: number; // RUT del trabajador
}

// Tipos para crear un reporte
export interface CreateReportDTO {
    title: string;
    description: string;
    area: string;
    severity: Report['severity'];
    photos: string[];
}

// Tipos para actualizar un reporte
export interface UpdateReportDTO {
    status: Report['status'];
    comment?: string;
}

// Estado de sincronización
export interface SyncStatus {
    isOnline: boolean;
    lastSync: string | null;
    pendingSyncs: number;
}