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
      console.log('📡 Cargando reporte ID:', reportId);
      const reportData = await reportService.getReportById(reportId, userToken);
      console.log('✅ Reporte cargado:', reportData);
      setCurrentReport(reportData);
    } catch (error: any) {
      console.error('❌ Error cargando reporte:', error);
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
              console.log('🔄 Actualizando estado del reporte:', reportId, 'a:', newStatusId);
              
              await reportService.updateReportStatus(
                reportId, 
                newStatusId, 
                `Estado cambiado a ${statusName} por administrador`,
                userToken
              );
              
              Alert.alert('✅ Éxito', 'Estado actualizado correctamente');
              
              // Recargar datos
              await loadReport();
            } catch (error: any) {
              console.error('❌ Error actualizando estado:', error);
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
      case 3: return '#f44336'; // Alta - Rojo
      case 2: return '#FFC107'; // Media - Amarillo
      case 1: return '#4CAF50'; // Baja - Verde
      default: return '#666';
    }
  };

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pendiente': return '#FFA500';
      case 'aprobado': return '#4CAF50';
      case 'rechazado': return '#f44336';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      {/* Header con título */}
      <View style={styles.header}>
        <Text style={styles.title}>{currentReport.Titulo}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(currentReport.Nombre_Estado) }
        ]}>
          <Text style={styles.statusBadgeText}>
            {currentReport.Nombre_Estado || 'Pendiente'}
          </Text>
        </View>
      </View>

      {/* ID del Reporte */}
      <View style={styles.idContainer}>
        <Text style={styles.idLabel}>ID del Reporte:</Text>
        <Text style={styles.idValue}>{currentReport.ID_Reporte}</Text>
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Descripción</Text>
        <Text style={styles.description}>
          {currentReport.Descripcion || 'Sin descripción'}
        </Text>
      </View>

      {/* Información del Reporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Área:</Text>
          <Text style={styles.infoValue}>
            {currentReport.Nombre_Area || 'No especificada'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Severidad:</Text>
          <View style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(currentReport.ID_Severidad) }
          ]}>
            <Text style={styles.severityText}>
              {currentReport.Nombre_Severidad || 'No especificada'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creado por:</Text>
          <Text style={styles.infoValue}>
            {currentReport.Nombre_Usuario || `RUT: ${currentReport.RUT}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de creación:</Text>
          <Text style={styles.infoValue}>
            {new Date(currentReport.Hora_Creado).toLocaleString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {currentReport.Hora_Sincronizado && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sincronizado:</Text>
            <Text style={styles.infoValue}>
              {new Date(currentReport.Hora_Sincronizado).toLocaleString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Cambiar Estado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Cambiar Estado</Text>
        
        <TouchableOpacity 
          style={[
            styles.statusButton, 
            { backgroundColor: '#FFA500' },
            currentReport.ID_Estado_Actual === 1 && styles.statusButtonActive
          ]} 
          onPress={() => updateStatus(1, 'Pendiente')}
          disabled={updating || currentReport.ID_Estado_Actual === 1}
        >
          <Text style={styles.statusButtonText}>
            {currentReport.ID_Estado_Actual === 1 ? '✓ ' : ''}Pendiente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.statusButton, 
            { backgroundColor: '#4CAF50' },
            currentReport.ID_Estado_Actual === 2 && styles.statusButtonActive
          ]} 
          onPress={() => updateStatus(2, 'Aprobado')}
          disabled={updating || currentReport.ID_Estado_Actual === 2}
        >
          <Text style={styles.statusButtonText}>
            {currentReport.ID_Estado_Actual === 2 ? '✓ ' : ''}Aprobar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.statusButton, 
            { backgroundColor: '#f44336' },
            currentReport.ID_Estado_Actual === 3 && styles.statusButtonActive
          ]} 
          onPress={() => updateStatus(3, 'Rechazado')}
          disabled={updating || currentReport.ID_Estado_Actual === 3}
        >
          <Text style={styles.statusButtonText}>
            {currentReport.ID_Estado_Actual === 3 ? '✓ ' : ''}Rechazar
          </Text>
        </TouchableOpacity>

        {updating && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.updatingIndicator} />
        )}
      </View>

      {/* Espaciado inferior */}
      <View style={{ height: 40 }} />
    </ScrollView>
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
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 14,
    color: '#666',
  },
  idValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 2,
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
  statusButtonActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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