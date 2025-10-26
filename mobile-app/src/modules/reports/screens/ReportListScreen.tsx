import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Report } from '../../../types/reports';
import { mockReportService } from '../../../mocks/reports';

/**
 * ReportListScreen - Pantalla principal de lista de reportes
 * 
 * Esta pantalla muestra todos los reportes disponibles y demuestra:
 * 1. Cómo cargar datos usando el servicio (sea mock o real)
 * 2. Cómo mostrar una lista de elementos
 * 3. Cómo manejar la navegación a los detalles
 */
export const ReportListScreen = ({ navigation }: any) => {
    // Estado para almacenar los reportes
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    // Efecto para cargar los reportes al montar el componente
    useEffect(() => {
        loadReports();
    }, []);

    // Función para cargar los reportes
    const loadReports = async () => {
        try {
            setLoading(true);
            // Aquí usamos el servicio mock, pero en producción usaríamos el real
            const data = await mockReportService.getReports();
            setReports(data);
        } catch (error) {
            console.error('Error cargando reportes:', error);
            // Aquí deberías mostrar un mensaje de error al usuario
        } finally {
            setLoading(false);
        }
    };

    // Renderiza cada item de la lista
    const renderItem = ({ item }: { item: Report }) => (
        <TouchableOpacity 
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        >
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportArea}>Área: {item.area}</Text>
            <View style={styles.reportMeta}>
                <Text style={getStatusStyle(item.status)}>
                    {item.status.toUpperCase()}
                </Text>
                <Text style={styles.reportDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            {!item.isSync && (
                <Text style={styles.syncStatus}>⚠️ Pendiente de sincronizar</Text>
            )}
        </TouchableOpacity>
    );

    // Función auxiliar para estilos según estado
    const getStatusStyle = (status: Report['status']) => ({
        ...styles.reportStatus,
        backgroundColor: 
            status === 'approved' ? '#4CAF50' :
            status === 'rejected' ? '#f44336' :
            '#FFC107'
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Reportes SIGRA</Text>
                <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateReport')}
                >
                    <Text style={styles.createButtonText}>+ Nuevo</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={styles.loading}>Cargando reportes...</Text>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onRefresh={loadReports}
                    refreshing={loading}
                />
            )}
        </View>
    );
};

// Estilos detallados y comentados
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    reportCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    reportArea: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    reportMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    reportDate: {
        color: '#666',
        fontSize: 12,
    },
    syncStatus: {
        marginTop: 8,
        color: '#f57c00',
        fontSize: 12,
    },
    loading: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});