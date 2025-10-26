import api from './api';

export const realReportService = {
    getReports: async () => {
        const response = await api.get('/reports');
        return response.data;
    },

    createReport: async (reportData: any) => {
        const response = await api.post('/reports', reportData);
        return response.data;
    },

    updateStatus: async (id: string, newStatus: string) => {
        const response = await api.put(`/reports/${id}/status`, { status: newStatus });
        return response.data;
    }
};