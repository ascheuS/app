// mobile-app/src/screens/AdminPanelScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

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

type AdminPanelScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminPanel'
>;

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
      const reportsData = await reportService.getAllReports(userToken);
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

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pendiente':
        return '#FFAA00';
      case 'aprobado':
        return '#4CAF50';
      case 'rechazado':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getSeverityColor = (severityId: number) => {
    switch (severityId) {
      case 3:
        return '#f44336';
      case 2:
        return '#FFC107';
      case 1:
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() =>
        navigation.navigate('AdminReportDetails', {
          reportId: item.ID_Reporte,
        })
      }
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.Titulo}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.Nombre_Estado || '') },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {item.Nombre_Estado || 'Pendiente'}
          </Text>
        </View>
      </View>

      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.Descripcion || 'Sin descripción'}
      </Text>

      <View style={styles.detailsRow}>
        {item.Nombre_Area && (
          <View style={styles.detailChip}>
            <Text style={styles.detailChipText}>📍 {item.Nombre_Area}</Text>
          </View>
        )}
        {item.Nombre_Severidad && (
          <View
            style={[
              styles.detailChip,
              { backgroundColor: getSeverityColor(item.ID_Severidad || 1) },
            ]}
          >
            <Text style={styles.detailChipText}>
              🚨 {item.Nombre_Severidad}
            </Text>
          </View>
        )}
        {item.Nombre_Usuario && (
          <View style={styles.detailChip}>
            <Text style={styles.detailChipText}>👤 {item.Nombre_Usuario}</Text>
          </View>
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.reportId}>ID: {item.ID_Reporte}</Text>
        <Text style={styles.reportDate}>
          {new Date(item.Hora_Creado).toLocaleDateString('es-CL')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFAA00" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Reportes Sincronizados</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {
              reports.filter(
                (r) => r.Nombre_Estado?.toLowerCase() === 'pendiente'
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.ID_Reporte.toString()}
        contentContainerStyle={
          reports.length === 0 ? styles.emptyList : styles.listContent
        }
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
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 25,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFAA00',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  reportCard: {
    backgroundColor: '#111',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#FFAA00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reportDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  detailChip: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailChipText: {
    color: '#fff',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 10,
  },
  reportId: {
    fontSize: 12,
    color: '#777',
  },
  reportDate: {
    fontSize: 12,
    color: '#777',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FFAA00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#aaa',
    textAlign: 'center',
  },
});

export default AdminPanelScreen;
