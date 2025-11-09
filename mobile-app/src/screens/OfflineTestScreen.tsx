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
import { obtenerReportesPendientes, sincronizarReportesPendientes } from '../services/syncReportsService';

const OfflineTestScreen: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [reportesPendientes, setReportesPendientes] = useState<number>(0);
  const [autoSyncActive, setAutoSyncActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('🔧 [DEBUG] OfflineTestScreen montado - configurando NetInfo');
    
    // Suscribirse a cambios de red
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📡 [DEBUG] Estado de red recibido:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details
      });
      
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    // Cargar estado inicial
    cargarEstado();

    return () => {
      console.log('🔧 [DEBUG] OfflineTestScreen desmontado - limpiando suscripción');
      unsubscribe();
    };
  }, []);

  const cargarEstado = async () => {
    try {
      console.log('🔍 [DEBUG] Cargando estado inicial...');
      setIsLoading(true);
      
      // Obtener estado actual de la red
      const state = await NetInfo.fetch();
      console.log('📡 [DEBUG] Estado inicial de NetInfo:', state);
      
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);

      // Obtener reportes pendientes
      const pendientes = await obtenerReportesPendientes();
      console.log(`📊 [DEBUG] Reportes pendientes: ${pendientes}`);
      setReportesPendientes(pendientes);

      // Verificar si auto-sync está activo
      const syncActivo = autoSyncService.isActive();
      console.log(`🔄 [DEBUG] Auto-sync activo: ${syncActivo}`);
      setAutoSyncActive(syncActivo);

    } catch (error) {
      console.error('❌ [DEBUG] Error cargando estado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testNetInfoManual = async () => {
    console.log('🧪 [DEBUG] Ejecutando test manual de NetInfo...');
    try {
      const state = await NetInfo.fetch();
      console.log('📡 [DEBUG] Test NetInfo - Resultado:', state);
      
      Alert.alert(
        '🧪 Test NetInfo', 
        `Conectado: ${state.isConnected}\nInternet alcanzable: ${state.isInternetReachable}\nTipo: ${state.type}\nDetalles: ${JSON.stringify(state.details)}`
      );
    } catch (error) {
      console.error('❌ [DEBUG] Error en test NetInfo:', error);
      Alert.alert('❌ Error', 'No se pudo obtener información de red');
    }
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
      console.log('🔄 [DEBUG] Iniciando sincronización manual...');
      setIsLoading(true);
      
      Alert.alert('🔄 Sincronizando...', 'Espera un momento');
      const sincronizados = await sincronizarReportesPendientes();
      
      console.log(`✅ [DEBUG] Sincronización completada: ${sincronizados} reportes`);
      
      if (sincronizados > 0) {
        Alert.alert('✅ Éxito', `Se sincronizaron ${sincronizados} reporte(s)`);
      } else {
        Alert.alert('ℹ️ Información', 'No hay reportes pendientes');
      }
      
      // Recargar estado después de sincronizar
      await cargarEstado();
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Error en sincronización:', error);
      Alert.alert('❌ Error', error.message || 'No se pudo sincronizar');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = () => {
    console.log(`🔄 [DEBUG] Cambiando auto-sync de ${autoSyncActive} a ${!autoSyncActive}`);
    
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

  const crearReporteTest = async () => {
    console.log('🧪 [DEBUG] Creando reporte de prueba...');
    // Aquí podrías agregar lógica para crear un reporte de prueba automáticamente
    Alert.alert(
      '🧪 Crear Reporte Test',
      'Para crear un reporte de prueba:\n\n1. Ve a "Crear Reporte"\n2. Llena los datos\n3. Guarda (funciona offline)\n4. Regresa aquí para ver el conteo'
    );
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

  const getConnectionTypeText = () => {
    const types: { [key: string]: string } = {
      'wifi': 'WiFi',
      'cellular': 'Datos Móviles',
      'ethernet': 'Ethernet',
      'bluetooth': 'Bluetooth',
      'vpn': 'VPN',
      'wimax': 'WiMAX',
      'none': 'Sin conexión',
      'unknown': 'Desconocido',
      'other': 'Otro'
    };
    return types[connectionType] || connectionType;
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
          <Text style={styles.value}>{getConnectionTypeText()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Conectado:</Text>
          <Text style={styles.value}>
            {isConnected === null ? 'Verificando...' : isConnected ? 'Sí' : 'No'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Internet alcanzable:</Text>
          <Text style={styles.value}>
            {isInternetReachable === null ? 'Verificando...' : isInternetReachable ? 'Sí' : 'No'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={cargarEstado}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Cargando...' : '🔄 Actualizar Estado'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testNetInfoManual}
        >
          <Text style={styles.buttonText}>🧪 Test NetInfo</Text>
        </TouchableOpacity>
      </View>

      {/* Sincronización */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Sincronización</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Reportes pendientes:</Text>
          <View style={[
            styles.badge,
            { backgroundColor: reportesPendientes > 0 ? '#FF9800' : '#4CAF50' }
          ]}>
            <Text style={styles.badgeText}>{reportesPendientes}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Auto-sincronización:</Text>
          <Text style={[styles.value, { color: autoSyncActive ? '#4CAF50' : '#999' }]}>
            {autoSyncActive ? '✅ Activa' : '❌ Inactiva'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={toggleAutoSync}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {autoSyncActive ? '🛑 Desactivar Auto-Sync' : '▶️ Activar Auto-Sync'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={forzarSincronizacion}
          disabled={!isConnected || reportesPendientes === 0 || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Sincronizando...' : '🔄 Sincronizar Ahora'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={crearReporteTest}
        >
          <Text style={styles.buttonText}>📝 Crear Reporte Test</Text>
        </TouchableOpacity>
      </View>

      {/* Información de Debug */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🐛 Información de Debug</Text>
        <Text style={styles.debugText}>
          {`Estado: ${isConnected}\nInternet: ${isInternetReachable}\nTipo: ${connectionType}\nPendientes: ${reportesPendientes}\nAutoSync: ${autoSyncActive}\nCargando: ${isLoading}`}
        </Text>
        
        <TouchableOpacity
          style={[styles.button, styles.debugButton]}
          onPress={() => console.log('🧪 [DEBUG] Log manual desde botón')}
        >
          <Text style={styles.buttonText}>📝 Log Manual</Text>
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
            1. Detén el backend{'\n'}
            2. Crea reportes (se guardan localmente){'\n'}
            3. Reinicia el backend{'\n'}
            4. Los reportes se sincronizan automáticamente
          </Text>
        </View>

        <TouchableOpacity style={styles.helpButton} onPress={simularOffline}>
          <Text style={styles.helpButtonText}>ℹ️ Ver Instrucciones Detalladas</Text>
        </TouchableOpacity>
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
  refreshButton: {
    backgroundColor: '#007AFF',
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  createButton: {
    backgroundColor: '#2196F3',
  },
  debugButton: {
    backgroundColor: '#607D8B',
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
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 18,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
  },
});

export default OfflineTestScreen;