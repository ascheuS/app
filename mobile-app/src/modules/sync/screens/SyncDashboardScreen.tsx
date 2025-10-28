import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SyncStatus } from '../../../types/reportes';

/**
 * SyncDashboardScreen - Panel de control de sincronización
 * 
 * Esta pantalla demuestra:
 * 1. Cómo manejar el estado de sincronización
 * 2. Cómo mostrar el estado de la conexión
 * 3. Cómo funciona el modo offline
 */
export const SyncDashboardScreen = () => {
    // Estados para manejar la sincronización
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isOnline: false,
        lastSync: null,
        pendingSyncs: 0
    });
    
    // Estado para modo automático
    const [autoSync, setAutoSync] = useState(true);

    // Simula verificación de conexión
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = () => {
        // En una implementación real, esto verificaría la conexión real
        setSyncStatus(prev => ({
            ...prev,
            isOnline: Math.random() > 0.5 // Simulación
        }));
    };

    return (
        <ScrollView style={styles.container}>
            {/* Sección de Estado */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado de Sincronización</Text>
                
                <View style={styles.statusCard}>
                    <Text style={styles.label}>Estado de Conexión:</Text>
                    <Text style={[
                        styles.statusText,
                        { color: syncStatus.isOnline ? '#4CAF50' : '#f44336' }
                    ]}>
                        {syncStatus.isOnline ? 'En línea' : 'Fuera de línea'}
                    </Text>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.label}>Última Sincronización:</Text>
                    <Text style={styles.value}>
                        {syncStatus.lastSync 
                            ? new Date(syncStatus.lastSync).toLocaleString()
                            : 'Nunca'}
                    </Text>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.label}>Reportes Pendientes:</Text>
                    <Text style={styles.value}>{syncStatus.pendingSyncs}</Text>
                </View>
            </View>

            {/* Sección de Configuración */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuración</Text>
                
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Sincronización Automática</Text>
                    <Switch
                        value={autoSync}
                        onValueChange={setAutoSync}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={autoSync ? '#007AFF' : '#f4f3f4'}
                    />
                </View>

                <Text style={styles.helpText}>
                    La sincronización automática enviará los reportes al servidor 
                    tan pronto como haya conexión disponible.
                </Text>
            </View>

            {/* Sección de Ayuda */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cómo funciona</Text>
                <Text style={styles.helpText}>
                    1. Los reportes se guardan localmente primero{'\n'}
                    2. Cuando hay conexión, se sincronizan automáticamente{'\n'}
                    3. Los reportes sincronizados se marcan como enviados{'\n'}
                    4. Puedes seguir trabajando sin conexión
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    statusCard: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    helpText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});