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

  // Cargar reportes cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      cargarReportes();
    }, [])
  );

  const cargarReportes = async () => {
    try {
      const db = getDB();
      
      // Consulta con JOINs para obtener nombres legibles
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
      console.log(`📋 Reportes cargados: ${result.length}`);
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
    console.log('Cerrando sesión...');
    await signOut();
  };

  const renderReporte = ({ item }: { item: ReporteLocal }) => {
    const esSincronizado = item.sincronizado === 1;
    const fechaCreacion = new Date(item.Hora_Creado);
    
    return (
      <View style={styles.reportCard}>
        {/* Header con título y estado de sincronización */}
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

        {/* Descripción */}
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.Descripcion || 'Sin descripción'}
        </Text>

        {/* Información adicional */}
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

        {/* Footer con fecha y estado */}
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
        <ActivityIndicator size="large" color="#007AFF" />
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

      {/* Lista de reportes */}
      <FlatList
        data={reportes}
        renderItem={renderReporte}
        keyExtractor={(item) => `reporte-${item.id_local}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        {userCargo !== 1 && (
          <View style={styles.buttonWrapper}>
            <Button
              title="Crear Reporte"
              onPress={() => navigation.navigate('CreateReport')}
              color="#007AFF"
            />
          </View>
        )}
        
        <View style={styles.buttonWrapper}>
          <Button
            title="Sincronizar"
            onPress={() => navigation.navigate('Sync' as any)}
            color="#4CAF50"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="🔍 Ver Base de Datos"
            onPress={() => navigation.navigate('Debug')}
            color="#9C27B0"
          />
        </View>

        {userCargo === 1 && (
          <View style={styles.buttonWrapper}>
            <Button
              title="Gestión de usuarios"
              onPress={() => navigation.navigate('AdminUsers')}
              color="#007AFF"
            />
          </View>
        )}

        <View style={styles.buttonWrapper}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            color="#FF3B30"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  headerBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  syncBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f57c00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonWrapper: {
    marginBottom: 12,
  },
});

export default HomeScreen;