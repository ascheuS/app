import { CreateReportDTO } from '../types/reports';

// Datos de ejemplo para desarrollo
export const mockReports = [
    {
        id: '1',
        title: 'Falla en equipo de seguridad',
        description: 'El arnés de seguridad presenta desgaste',
        area: 'Construcción',
        severity: 'high' as const,
        status: 'pending' as const,
        photos: ['mock_photo_1.jpg'],
        createdAt: '2025-10-26T10:00:00Z',
        isSync: true,
        createdBy: 123456789 // RUT de ejemplo
    },
    {
        id: '2',
        title: 'Derrame de líquido',
        description: 'Derrame de aceite en área de mantenimiento',
        area: 'Mantenimiento',
        severity: 'medium' as const,
        status: 'approved' as const,
        photos: ['mock_photo_2.jpg'],
        createdAt: '2025-10-26T11:30:00Z',
        isSync: true,
        createdBy: 987654321 // RUT de ejemplo
    }
];

// Funciones simuladas
export const mockReportService = {
    // Simula obtener reportes
    getReports: async () => {
        return mockReports;
    },

    // Simula crear un reporte
    createReport: async (reportData: CreateReportDTO) => {
        console.log('Mock: Creando reporte', reportData);
        return {
            id: Date.now().toString(),
            ...reportData,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            isSync: false,
            createdBy: 123456789 // RUT de ejemplo por defecto
        };
    },

    // Simula actualizar estado
    updateStatus: async (id: string, newStatus: string) => {
        console.log('Mock: Actualizando estado', { id, newStatus });
    }
};