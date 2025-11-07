// mobile-app/src/screens/DebugScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getDB } from '../db/database';

interface ReporteLocal {
  id_local: number;
  id_servidor: number | null;
  Titulo: string;
  Descripcion: string;
  Fecha_Reporte: string;
  UUID_Cliente: string;
  sincronizado: number;
  RUT: number;
  ID_Area: number;
  ID_Severidad: number;
  ID_Estado_Actual: number;
  Hora_Creado: string;
}

interface Catalogo {
  id: number;
  nombre: string;
}

const DebugScreen: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteLocal[]>([]);
  const [areas, setAreas] = useState<Catalogo[]>([]);
  const [severidades, setSeveridades] = useState<Catalogo[]>([]);
  const [estados, setEstados] = useState<Catalogo[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const db = getDB();

      // Cargar reportes
      const reps = await db.getAllAsync<ReporteLocal>('SELECT * FROM Reportes ORDER BY id_local DESC');
      setReportes(reps);

      // Cargar catálogos
      const areasRes = await db.getAllAsync<any>('SELECT ID_Area as id, Nombre_Area as nombre FROM Areas');
      setAreas(areasRes);

      const sevsRes = await db.getAllAsync<any>('SELECT ID_Severidad as id, Nombre_Severidad as nombre FROM Severidad');
      setSeveridades(sevsRes);

      const estsRes = await db.getAllAsync<any>('SELECT ID_Estado_Actual as id, Nombre_Estado as nombre FROM Estado_reportes');
      setEstados(estsRes);

      console.log('📊 Datos cargados:');
      console.log('  - Reportes:', reps.length);
      console.log('  - Áreas:', areasRes.length);
      console.log('  - Severidades:', sevsRes.length);
      console.log('  - Estados:', estsRes.length);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la base de datos');
    }
  };

  const limpiarReportes = async () => {
    Alert.alert(
      '⚠️ Confirmar',
      '¿Estás seguro de que quieres eliminar TODOS los reportes locales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDB();
              await db.runAsync('DELETE FROM Reportes');
              Alert.alert('✅ Éxito', 'Todos los reportes fueron eliminados');
              cargarDatos();
            } catch (error) {
              console.error('Error eliminando reportes:', error);
              Alert.alert('Error', 'No se pudieron eliminar los reportes');
            }
          },
        },
      ]
    );
  };

  const verDetalles = (reporte: ReporteLocal) => {
    const area = areas.find(a => a.id === reporte.ID_Area);
    const severidad = severidades.find(s => s.id === reporte.ID_Severidad);
    const estado = estados.find(e => e.id === reporte.ID_Estado_Actual);

    Alert.alert(
      reporte.Titulo,
      `
ID Local: ${reporte.id_local}
ID Servidor: ${reporte.id_servidor || 'Pendiente'}
UUID: ${reporte.UUID_Cliente}

Descripción: ${reporte.Descripcion || 'Sin descripción'}

Área: ${area?.nombre || 'N/A'}
Severidad: ${severidad?.nombre || 'N/A'}
Estado: ${estado?.nombre || 'N/A'}

RUT: ${reporte.RUT}
Fecha: ${reporte.Fecha_Reporte}
Creado: ${new Date(reporte.Hora_Creado).toLocaleString()}

Sincronizado: ${reporte.sincronizado ? 'Sí' : 'No'}
      `.trim()
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Debug SQLite</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{reportes.length}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {reportes.filter(r => r.sincronizado === 0).length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {reportes.filter(r => r.sincronizado === 1).length}
            </Text>
            <Text style={styles.statLabel}>Sincronizados</Text>
          </View>
        </View>
      </View>

      {/* Sección de Catálogos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Catálogos</Text>
        <View style={styles.catalogRow}>
          <Text style={styles.catalogItem}>Áreas: {areas.length}</Text>
          <Text style={styles.catalogItem}>Severidades: {severidades.length}</Text>
          <Text style={styles.catalogItem}>Estados: {estados.length}</Text>
        </View>
      </View>

      {/* Lista de Reportes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Reportes Locales</Text>
        {reportes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay reportes guardados</Text>
          </View>
        ) : (
          reportes.map((reporte, index) => (
            <TouchableOpacity
              key={reporte.id_local}
              style={styles.reportCard}
              onPress={() => verDetalles(reporte)}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportIndex}>#{index + 1}</Text>
                <View
                  style={[
                    styles.syncBadge,
                    { backgroundColor: reporte.sincronizado ? '#4CAF50' : '#f57c00' },
                  ]}
                >
                  <Text style={styles.syncBadgeText}>
                    {reporte.sincronizado ? '✓' : '⟳'}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportTitle} numberOfLines={1}>
                {reporte.Titulo}
              </Text>
              <Text style={styles.reportMeta}>
                ID Local: {reporte.id_local} | 
                {reporte.id_servidor ? ` ID Servidor: ${reporte.id_servidor}` : ' Sin sincronizar'}
              </Text>
              <Text style={styles.reportUUID} numberOfLines={1}>
                UUID: {reporte.UUID_Cliente}
              </Text>
              <Text style={styles.reportDate}>
                {new Date(reporte.Hora_Creado).toLocaleString('es-CL')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Botones de Acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.refreshButton} onPress={cargarDatos}>
          <Text style={styles.buttonText}>🔄 Recargar</Text>
        </TouchableOpacity>

        {reportes.length > 0 && (
          <TouchableOpacity style={styles.deleteButton} onPress={limpiarReportes}>
            <Text style={styles.buttonText}>🗑️ Eliminar Todos</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  catalogRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  catalogItem: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  syncBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reportUUID: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DebugScreen;