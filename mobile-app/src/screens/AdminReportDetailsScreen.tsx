// mobile-app/src/screens/AdminReportDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AdminReportDetailsRouteProp = RouteProp<RootStackParamList, 'AdminReportDetails'>;
type AdminReportDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminReportDetails'>;

interface ReportDetail {
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

const AdminReportDetailsScreen = () => {
  const route = useRoute<AdminReportDetailsRouteProp>();
  const navigation = useNavigation<AdminReportDetailsNavigationProp>();
  const { userToken } = useAuth() as any;
  const { reportId } = route.params;

  const [currentReport, setCurrentReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const reportData = await reportService.getReportById(reportId, userToken);
      setCurrentReport(reportData);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el reporte: ' + (error.message || 'Error desconocido'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatusId: number, statusName: string) => {
    Alert.alert(
      'Confirmar Cambio',
      `¿Cambiar estado a "${statusName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpdating(true);
            try {
              await reportService.updateReportStatus(
                reportId, 
                newStatusId, 
                `Estado cambiado a ${statusName} por administrador`,
                userToken
              );
              Alert.alert('✅ Éxito', 'Estado actualizado correctamente');
              await loadReport();
            } catch (error: any) {
              Alert.alert(
                'Error', 
                'No se pudo actualizar el estado: ' + (error.response?.data?.detail || error.message)
              );
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getSeverityColor = (severityId?: number) => {
    switch (severityId) {
      case 3: return '#f44336';
      case 2: return '#FFC107';
      case 1: return '#4CAF50';
      default: return '#888';
    }
  };

  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pendiente': return '#FFA500';
      case 'aprobado': return '#4CAF50';
      case 'rechazado': return '#f44336';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando detalles del reporte...</Text>
      </View>
    );
  }

  if (!currentReport) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró el reporte</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{currentReport.Titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentReport.Nombre_Estado) }]}>
          <Text style={styles.statusBadgeText}>{currentReport.Nombre_Estado || 'Pendiente'}</Text>
        </View>
      </View>

      {/* ID */}
      <View style={styles.idContainer}>
        <Text style={styles.idLabel}>ID del Reporte:</Text>
        <Text style={styles.idValue}>{currentReport.ID_Reporte}</Text>
      </View>

      {/* DESCRIPCIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Descripción</Text>
        <Text style={styles.description}>{currentReport.Descripcion || 'Sin descripción'}</Text>
      </View>

      {/* INFO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Área:</Text>
          <Text style={styles.infoValue}>{currentReport.Nombre_Area || 'No especificada'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Severidad:</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(currentReport.ID_Severidad) }]}>
            <Text style={styles.severityText}>{currentReport.Nombre_Severidad || 'No especificada'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creado por:</Text>
          <Text style={styles.infoValue}>{currentReport.Nombre_Usuario || `RUT: ${currentReport.RUT}`}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de creación:</Text>
          <Text style={styles.infoValue}>
            {new Date(currentReport.Hora_Creado).toLocaleString('es-CL', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>

        {currentReport.Hora_Sincronizado && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sincronizado:</Text>
            <Text style={styles.infoValue}>
              {new Date(currentReport.Hora_Sincronizado).toLocaleString('es-CL', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>

      {/* ESTADO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Cambiar Estado</Text>

        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#FFA500' }]} 
          onPress={() => updateStatus(1, 'Pendiente')}
          disabled={updating || currentReport.ID_Estado_Actual === 1}
        >
          <Text style={styles.statusButtonText}>Pendiente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#4CAF50' }]} 
          onPress={() => updateStatus(2, 'Aprobado')}
          disabled={updating || currentReport.ID_Estado_Actual === 2}
        >
          <Text style={styles.statusButtonText}>Aprobar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#f44336' }]} 
          onPress={() => updateStatus(3, 'Rechazado')}
          disabled={updating || currentReport.ID_Estado_Actual === 3}
        >
          <Text style={styles.statusButtonText}>Rechazar</Text>
        </TouchableOpacity>

        {updating && <ActivityIndicator size="large" color="#FFA500" style={styles.updatingIndicator} />}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#000000ff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  idContainer: {
    backgroundColor: '#000000ff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  idValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500',
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ccc',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'right',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updatingIndicator: {
    marginTop: 16,
  },
});

export default AdminReportDetailsScreen;
