// mobile-app/src/services/autoSyncService.ts
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { sincronizarReportesPendientes, obtenerReportesPendientes } from './syncReportsService';

class AutoSyncService {
  private syncInterval: number | null = null;
  private appStateSubscription: any = null;
  private netInfoSubscription: any = null;
  private isSyncing: boolean = false;
  private isEnabled: boolean = false;

  /**
   * Inicia el servicio de sincronización automática
   */
  start() {
    if (this.isEnabled) {
      console.log('⚠️ Sincronización automática ya está activa');
      return;
    }

    console.log('🔄 Iniciando sincronización automática...');
    this.isEnabled = true;

    // 1. Sincronizar inmediatamente al iniciar
    this.intentarSincronizacion();

    this.syncInterval = setInterval(() => {
    this.intentarSincronizacion();
    }, 5 * 60 * 1000);

    // 3. Sincronizar cuando la app vuelve a primer plano
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    // 4. Sincronizar cuando se recupera la conexión
    this.netInfoSubscription = NetInfo.addEventListener(this.handleNetworkChange);

    console.log('✅ Sincronización automática activada');
  }

  /**
   * Detiene el servicio de sincronización automática
   */
  stop() {
    if (!this.isEnabled) {
      return;
    }

    console.log('🛑 Deteniendo sincronización automática...');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }

    this.isEnabled = false;
    console.log('✅ Sincronización automática detenida');
  }

  /**
   * Maneja cambios en el estado de la app (background/foreground)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('📱 App en primer plano - verificando sincronización');
      // Esperar 2 segundos para que la app se estabilice
      setTimeout(() => {
        this.intentarSincronizacion();
      }, 2000);
    }
  };

  /**
   * Maneja cambios en la conectividad de red
   */
  private handleNetworkChange = (state: any) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('🌐 Conexión restaurada - iniciando sincronización');
      setTimeout(() => {
        this.intentarSincronizacion();
      }, 1000);
    } else {
      console.log('📴 Sin conexión a internet');
    }
  };

  /**
   * Intenta sincronizar reportes pendientes
   */
  private async intentarSincronizacion() {
    // Evitar sincronizaciones simultáneas
    if (this.isSyncing) {
      console.log('⏳ Sincronización ya en progreso, omitiendo...');
      return;
    }

    try {
      // Verificar si hay reportes pendientes
      const pendientes = await obtenerReportesPendientes();
      
      if (pendientes === 0) {
        console.log('✅ No hay reportes pendientes de sincronizar');
        return;
      }

      console.log(`📤 Intentando sincronizar ${pendientes} reporte(s)...`);
      this.isSyncing = true;

      // Sincronizar
      const sincronizados = await sincronizarReportesPendientes();
      
      if (sincronizados > 0) {
        console.log(`✅ ${sincronizados} reporte(s) sincronizado(s) exitosamente`);
      }

    } catch (error: any) {
      console.error('❌ Error en sincronización automática:', error.message);
      // No mostrar alerts aquí para no interrumpir al usuario
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincroniza inmediatamente (forzado)
   */
  async syncNow(): Promise<number> {
    console.log('🔄 Sincronización manual forzada');
    const sincronizados = await sincronizarReportesPendientes();
    return sincronizados;
  }

  /**
   * Verifica si el servicio está activo
   */
  isActive(): boolean {
    return this.isEnabled;
  }
}

// Exportar una instancia única (Singleton)
export const autoSyncService = new AutoSyncService();