import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Report } from '../../../types/reportes';
import { mockReports } from '../../../mocks/reports';

/**
 * AdminDashboardScreen - Panel de Administración
 * 
 * Esta pantalla demuestra:
 * 1. Cómo implementar filtros
 * 2. Cómo manejar cambios de estado
 * 3. Cómo mostrar información detallada
 */
export const AdminDashboardScreen = () => {
    // Estados para filtros y datos
    const [reports] = useState<Report[]>(mockReports);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<Report['status'] | 'all'>('all');

    // Filtrar reportes
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchText.toLowerCase()) ||
                            report.area.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Renderizar cada reporte
    const renderReport = ({ item }: { item: Report }) => (
        <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>

            <Text style={styles.reportInfo}>Área: {item.area}</Text>
            <Text style={styles.reportInfo}>Severidad: {item.severity}</Text>
            <Text style={styles.reportInfo}>
                Creado: {new Date(item.createdAt).toLocaleDateString()}
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => console.log('Aprobar', item.id)}
                >
                    <Text style={styles.actionText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                    onPress={() => console.log('Rechazar', item.id)}
                >
                    <Text style={styles.actionText}>Rechazar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Componente para mostrar el estado
    const StatusBadge = ({ status }: { status: Report['status'] }) => (
        <View style={[
            styles.badge,
            { backgroundColor: 
                status === 'approved' ? '#4CAF50' :
                status === 'rejected' ? '#f44336' :
                '#FFC107'
            }
        ]}>
            <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
        </View>
    );

    // Botones de filtro por estado
    const FilterButton = ({ status, label }: { status: Report['status'] | 'all', label: string }) => (
        <TouchableOpacity 
            style={[
                styles.filterButton,
                selectedStatus === status && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
        >
            <Text style={[
                styles.filterButtonText,
                selectedStatus === status && styles.filterButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por título o área..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {/* Filtros de estado */}
            <View style={styles.filters}>
                <FilterButton status="all" label="Todos" />
                <FilterButton status="pending" label="Pendientes" />
                <FilterButton status="approved" label="Aprobados" />
                <FilterButton status="rejected" label="Rechazados" />
            </View>

            {/* Lista de reportes */}
            <FlatList
                data={filteredReports}
                renderItem={renderReport}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchInput: {
        margin: 16,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 1,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 1,
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterButtonText: {
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    list: {
        padding: 16,
    },
    reportCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        elevation: 1,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    reportInfo: {
        color: '#666',
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});