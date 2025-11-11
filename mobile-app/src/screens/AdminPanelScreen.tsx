// mobile-app/src/screens/AdminPanelScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

// ✅ Interface que coincide con la estructura del backend
interface Report {
  ID_Reporte: number;
  Titulo: string;
  Descripcion?: string;
  Fecha_Reporte?: string;
  Hora_Creado: string;
  Hora_Sincronizado?: string;
  RUT?: number;
  ID_Area?: number;
  Nombre_Area?: string;
  ID_Severidad?: number;
  Nombre_Severidad?: string;
  ID_Estado_Actual?: number;
  Nombre_Estado?: string;
  Nombre_Usuario?: string;
}

type AdminPanelScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminPanel'>;

const AdminPanelScreen = () => {
  const navigation = useNavigation<AdminPanelScreenNavigationProp>();
  const { userToken } = useAuth() as any;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError(null);
      if (!userToken) {
        setError('No hay token de autenticación');
        return;
      }

      console.log('📡 Cargando reportes...');
      const reportsData = await reportService.getAllReports(userToken);
      console.log('✅ Reportes recibidos:', reportsData.length);
      console.log('📋 Primer reporte:', reportsData[0]);
      
      setReports(reportsData);
    } catch (error: any) {
      console.error('❌ Error loading reports:', error);
      setError(error.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const renderReportItem = ({ item }: { item: Report }) => {
    console.log('🔍 Renderizando reporte ID:', item.ID_Reporte);
    
    return (
      <TouchableOpacity
        style={styles.reportItem}
        onPress={() => {
          console.log('👆 Navegando a detalles del reporte:', item.ID_Reporte);
          navigation.navigate('AdminReportDetails', {
            reportId: item.ID_Reporte // ✅ Usar ID_Reporte con mayúsculas
          });
        }}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{item.Titulo}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.Nombre_Estado || '') }
          ]}>
            <Text style={styles.statusBadgeText}>
              {item.Nombre_Estado || 'Pendiente'}
            </Text>
          </View>
        </View>

        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.Descripcion || 'Sin descripción'}
        </Text>

        <View style={styles.reportDetails}>
          {item.Nombre_Area && (
            <View style={styles.detailChip}>
              <Text style={styles.detailChipText}>📍 {item.Nombre_Area}</Text>
            </View>
          )}
          {item.Nombre_Severidad && (
            <View style={[
              styles.detailChip,
              { backgroundColor: getSeverityColor(item.ID_Severidad || 1) }
            ]}>
              <Text style={styles.detailChipText}>🚨 {item.Nombre_Severidad}</Text>
            </View>
          )}
          {item.Nombre_Usuario && (
            <View style={styles.detailChip}>
              <Text style={styles.detailChipText}>👤 {item.Nombre_Usuario}</Text>
            </View>
          )}
        </View>

        <View style={styles.reportFooter}>
          <Text style={styles.reportId}>ID: {item.ID_Reporte}</Text>
          <Text style={styles.reportDate}>
            {new Date(item.Hora_Creado).toLocaleDateString('es-CL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pendiente': return '#FFA500';
      case 'aprobado': return '#4CAF50';
      case 'rechazado': return '#f44336';
      default: return '#666';
    }
  };

  const getSeverityColor = (severityId: number) => {
    switch (severityId) {
      case 3: return '#f44336'; // Alta
      case 2: return '#FFC107'; // Media
      case 1: return '#4CAF50'; // Baja
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
          <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Reportes Sincronizados</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.Nombre_Estado?.toLowerCase() === 'pendiente').length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.ID_Reporte.toString()}
        contentContainerStyle={reports.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No hay reportes sincronizados</Text>
            <Text style={styles.emptySubtext}>
              Los reportes aparecerán aquí cuando los trabajadores los sincronicen
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  reportItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailChipText: {
    fontSize: 12,
    color: '#333',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reportId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
export default AdminPanelScreen;