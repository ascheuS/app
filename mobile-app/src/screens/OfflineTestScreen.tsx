// mobile-app/src/screens/OfflineTestScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { autoSyncService } from '../services/autoSyncService';
import { obtenerReportesPendientes } from '../services/syncReportsService';

const OfflineTestScreen: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [reportesPendientes, setReportesPendientes] = useState<number>(0);
  const [autoSyncActive, setAutoSyncActive] = useState<boolean>(false);

  useEffect(() => {
    // Suscribirse a cambios de red
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📡 Estado de red:', state);
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    // Cargar estado inicial
    cargarEstado();

    return () => {
      unsubscribe();
    };
  }, []);

  const cargarEstado = async () => {
    // Obtener estado actual de la red
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    setIsInternetReachable(state.isInternetReachable);
    setConnectionType(state.type);

    // Obtener reportes pendientes
    const pendientes = await obtenerReportesPendientes();
    setReportesPendientes(pendientes);

    // Verificar si auto-sync está activo
    setAutoSyncActive(autoSyncService.isActive());
  };

  const simularOffline = () => {
    Alert.alert(
      '📴 Simular Modo Offline',
      'Para probar el modo offline:\n\n' +
      '1. Activa el Modo Avión en tu teléfono\n' +
      '2. O desactiva WiFi y Datos móviles\n' +
      '3. Crea reportes normalmente\n' +
      '4. Los reportes se guardarán localmente\n' +
      '5. Restaura la conexión para sincronizar\n\n' +
      '💡 También puedes apagar el backend para simular servidor caído.'
    );
  };

  const forzarSincronizacion = async () => {
    try {
      Alert.alert('🔄 Sincronizando...', 'Espera un momento');
      const sincronizados = await autoSyncService.syncNow();
      
      if (sincronizados > 0) {
        Alert.alert('✅ Éxito', `Se sincronizaron ${sincronizados} reporte(s)`);
      } else {
        Alert.alert('ℹ️ Información', 'No hay reportes pendientes');
      }
      
      cargarEstado();
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'No se pudo sincronizar');
    }
  };

  const toggleAutoSync = () => {
    if (autoSyncActive) {
      autoSyncService.stop();
      setAutoSyncActive(false);
      Alert.alert('🛑 Desactivado', 'Sincronización automática desactivada');
    } else {
      autoSyncService.start();
      setAutoSyncActive(true);
      Alert.alert('✅ Activado', 'Sincronización automática activada');
    }
  };

  const getConnectionStatusColor = () => {
    if (isConnected && isInternetReachable) return '#4CAF50';
    if (isConnected && !isInternetReachable) return '#FFC107';
    return '#f44336';
  };

  const getConnectionStatusText = () => {
    if (isConnected && isInternetReachable) return 'Conectado a Internet';
    if (isConnected && !isInternetReachable) return 'Conectado sin Internet';
    return 'Sin conexión';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Estado de Conexión */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📡 Estado de Red</Text>
        
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getConnectionStatusColor() }
            ]}
          />
          <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo de conexión:</Text>
          <Text style={styles.value}>{connectionType || 'Desconocido'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Conectado:</Text>
          <Text style={styles.value}>{isConnected ? 'Sí' : 'No'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Internet alcanzable:</Text>
          <Text style={styles.value}>
            {isInternetReachable === null ? 'Verificando...' : isInternetReachable ? 'Sí' : 'No'}
          </Text>
        </View>
      </View>

      {/* Sincronización */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Sincronización</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Reportes pendientes:</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reportesPendientes}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Auto-sincronización:</Text>
          <Text style={[styles.value, { color: autoSyncActive ? '#4CAF50' : '#999' }]}>
            {autoSyncActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={toggleAutoSync}
        >
          <Text style={styles.buttonText}>
            {autoSyncActive ? '🛑 Desactivar Auto-Sync' : '▶️ Activar Auto-Sync'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={forzarSincronizacion}
          disabled={!isConnected || reportesPendientes === 0}
        >
          <Text style={styles.buttonText}>🔄 Sincronizar Ahora</Text>
        </TouchableOpacity>
      </View>

      {/* Guía de Pruebas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧪 Cómo Probar Offline</Text>
        
        <View style={styles.testSteps}>
          <Text style={styles.stepTitle}>Opción 1: Modo Avión</Text>
          <Text style={styles.stepText}>
            1. Activa el Modo Avión{'\n'}
            2. Crea reportes (se guardan localmente){'\n'}
            3. Desactiva Modo Avión{'\n'}
            4. Los reportes se sincronizan automáticamente
          </Text>

          <Text style={[styles.stepTitle, { marginTop: 16 }]}>Opción 2: Servidor Caído</Text>
          <Text style={styles.stepText}>
            1. Detén el backend (docker-compose stop){'\n'}
            2. Crea reportes (se guardan localmente){'\n'}
            3. Reinicia el backend (docker-compose start){'\n'}
            4. Los reportes se sincronizan automáticamente
          </Text>

          <Text style={[styles.stepTitle, { marginTop: 16 }]}>Opción 3: WiFi Desconectado</Text>
          <Text style={styles.stepText}>
            1. Desactiva WiFi y Datos móviles{'\n'}
            2. Crea reportes{'\n'}
            3. Reactiva la conexión{'\n'}
            4. Verifica sincronización automática
          </Text>
        </View>

        <TouchableOpacity style={styles.helpButton} onPress={simularOffline}>
          <Text style={styles.helpButtonText}>ℹ️ Ver Instrucciones Detalladas</Text>
        </TouchableOpacity>
      </View>

      {/* Comportamiento Auto-Sync */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Comportamiento Auto-Sync</Text>
        <Text style={styles.infoText}>
          La sincronización automática se activa en:{'\n\n'}
          • Al iniciar sesión{'\n'}
          • Cada 5 minutos{'\n'}
          • Al volver la app a primer plano{'\n'}
          • Al recuperar la conexión{'\n\n'}
          Se desactiva al cerrar sesión.
        </Text>
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
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  toggleButton: {
    backgroundColor: '#9C27B0',
  },
  syncButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testSteps: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  helpButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default OfflineTestScreen;