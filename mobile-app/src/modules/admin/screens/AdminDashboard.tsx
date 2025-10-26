import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { mockReportService, mockReports } from '../../../mocks/reports';

export const AdminDashboard = () => {
    const [reports, setReports] = useState(mockReports);

    useEffect(() => {
        // Cargar reportes usando el servicio mock
        loadReports();
    }, []);

    const loadReports = async () => {
        const data = await mockReportService.getReports();
        setReports(data);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await mockReportService.updateStatus(id, newStatus);
        // Recargar reportes después de actualizar
        loadReports();
    };

    return (
        <View>
            <Text>Panel de Administración</Text>
            <FlatList
                data={reports}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.title}</Text>
                        <Text>Estado: {item.status}</Text>
                    </View>
                )}
            />
        </View>
    );
};