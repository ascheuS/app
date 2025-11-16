// mobile-app/src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getDB } from '../db/database';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface ReporteLocal {
  id_local: number;
  id_servidor: number | null;
  Titulo: string;
  Descripcion: string;
  Fecha_Reporte: string;
  sincronizado: number;
  ID_Area: number;
  ID_Severidad: number;
  ID_Estado_Actual: number;
  Hora_Creado: string;
  Nombre_Area?: string;
  Nombre_Severidad?: string;
  Nombre_Estado?: string;
}

const HomeScreen: React.FC = () => {
  const { signOut, userCargo } = useAuth() as any;
  const navigation = useNavigation<HomeNavigationProp>();
  
  const [reportes, setReportes] = useState<ReporteLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarReportes();
    }, [])
  );

  const cargarReportes = async () => {
    try {
      const db = getDB();
      const sql = `
        SELECT 
          r.*,
          a.Nombre_Area,
          s.Nombre_Severidad,
          e.Nombre_Estado
        FROM Reportes r
        LEFT JOIN Areas a ON r.ID_Area = a.ID_Area
        LEFT JOIN Severidad s ON r.ID_Severidad = s.ID_Severidad
        LEFT JOIN Estado_reportes e ON r.ID_Estado_Actual = e.ID_Estado_Actual
        ORDER BY r.Hora_Creado DESC
      `;
      const result = await db.getAllAsync<ReporteLocal>(sql);
      setReportes(result);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarReportes();
  };

  const handleLogout = async () => {
    await signOut();
  };

  const renderReporte = ({ item }: { item: ReporteLocal }) => {
    const esSincronizado = item.sincronizado === 1;
    const fechaCreacion = new Date(item.Hora_Creado);
    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {item.Titulo}
          </Text>
          {!esSincronizado && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>●</Text>
            </View>
          )}
        </View>

        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.Descripcion || 'Sin descripción'}
        </Text>

        <View style={styles.reportInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Área:</Text>
            <Text style={styles.infoValue}>{item.Nombre_Area || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Severidad:</Text>
            <View style={[
              styles.severityBadge,
              {
                backgroundColor:
                  item.ID_Severidad === 3 ? '#f44336' :
                  item.ID_Severidad === 2 ? '#FFC107' :
                  '#4CAF50'
              }
            ]}>
              <Text style={styles.severityText}>
                {item.Nombre_Severidad || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.reportFooter}>
          <Text style={styles.reportDate}>
            {fechaCreacion.toLocaleDateString('es-CL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={[
            styles.syncStatus,
            { color: esSincronizado ? '#4CAF50' : '#f57c00' }
          ]}>
            {esSincronizado ? '✓ Sincronizado' : '⟳ Pendiente'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No hay reportes</Text>
      <Text style={styles.emptyText}>
        Crea tu primer reporte presionando el botón "Crear Reporte"
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reportes</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{reportes.length}</Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={reportes}
        renderItem={renderReporte}
        keyExtractor={(item) => `reporte-${item.id_local}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Botones */}
      <View style={styles.actionsContainer}>
        {userCargo !== 1 && (
          <TouchableOpacity style={styles.orangeButton} onPress={() => navigation.navigate('CreateReport')}>
            <Text style={styles.orangeButtonText}>Crear Reporte</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.orangeButton} onPress={() => navigation.navigate('OfflineTest')}>
          <Text style={styles.orangeButtonText}>Testing Offline/Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.orangeButton} onPress={() => navigation.navigate('Debug')}>
          <Text style={styles.orangeButtonText}>🔍 Ver Base de Datos</Text>
        </TouchableOpacity>

        {userCargo === 1 && (
          <TouchableOpacity style={styles.orangeButton} onPress={() => navigation.navigate('AdminUsers')}>
            <Text style={styles.orangeButtonText}>Gestión de usuarios</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.orangeButton, { backgroundColor: '#FF3B30' }]} onPress={handleLogout}>
          <Text style={styles.orangeButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const   styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#ccc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', flex: 1 },
  headerBadge: { backgroundColor: '#f57c00', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  listContent: { padding: 16, flexGrow: 1 },
  reportCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reportTitle: { fontSize: 18, fontWeight: '700', color: '#fff', flex: 1, marginRight: 8 },
  syncBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f57c00', justifyContent: 'center', alignItems: 'center' },
  syncBadgeText: { color: '#fff', fontSize: 10 },
  reportDescription: { fontSize: 14, color: '#bbb', marginBottom: 12 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: '500' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  severityText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  reportDate: { fontSize: 12, color: '#aaa' },
  syncStatus: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#ccc', textAlign: 'center', paddingHorizontal: 40 },
  actionsContainer: { backgroundColor: '#1E1E1E', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  orangeButton: { backgroundColor: '#f57c00', paddingVertical: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  orangeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;
