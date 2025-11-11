// mobile-app/src/services/api.ts
import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { LoginRequest, LoginResponse, PasswordChangeRequest, PasswordChangeResponse, CreateUserRequest, CreateUserResponse } from '../types/auth';
import { Area, Severidad, CreateReportDTO } from '../types/reportes';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
});

// Log de configuración inicial
console.log('🌐 API configurada con:', {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT
});

// ✅ INTERCEPTOR PARA AGREGAR TOKEN AUTOMÁTICAMENTE
api.interceptors.request.use(
    async (config) => {
        // Intentar obtener el token
        const token = await SecureStore.getItemAsync('userToken');
        
        // Si existe token y no es "primer_inicio", agregarlo al header
        if (token && token !== 'primer_inicio') {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token agregado al request:', config.url);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar tokens expirados
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            console.log('🔄 Token expirado, limpiando token y storage...');
            
            // Limpiar el token
            await SecureStore.deleteItemAsync('userToken');
            
            // Redireccionar a login
            if (global.navigation) {
                console.log('🔀 Redirigiendo a login por token expirado');
                global.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    login: async (rut: number, password: string): Promise<LoginResponse> => {
        try {
            const loginData: LoginRequest = {
                RUT: rut,
                password
            };
            console.log('📡 Enviando datos de login:', loginData);
            const response = await api.post<LoginResponse>('/auth/login', loginData);
            console.log('✅ Respuesta del servidor:', response.data);
            console.log('🔑 Token recibido:', response.data.access_token);
            
            // Guardar el token
            await SecureStore.setItemAsync('userToken', response.data.access_token);
            console.log('💾 Token guardado en SecureStore');
            
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en login:', error.response?.data || error.message);
            throw error;
        }
    },
    
    changePassword: async (currentPassword: string, newPassword: string, rut?: number): Promise<PasswordChangeResponse> => {
        try {
            const passwordData: PasswordChangeRequest & { RUT?: number } = {
                password: currentPassword,
                new_password: newPassword,
            };
            if (rut) passwordData.RUT = rut;

            console.log('📡 Enviando solicitud de cambio de contraseña', { rut: rut ? 'provided' : 'none' });
            
            // El token se agrega automáticamente por el interceptor
            const response = await api.post<PasswordChangeResponse>('/auth/cambiar-password', passwordData);
            console.log('✅ Contraseña cambiada exitosamente');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al cambiar contraseña:', error.response?.data || error.message);
            throw error;
        }
    },
    
    createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.post<CreateUserResponse>('/auth/usuarios', userData);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al crear usuario:', error.response?.data || error.message);
            throw error;
        }
    },
    
    getUsers: async (): Promise<any[]> => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.get<any[]>('/auth/usuarios');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener usuarios:', error.response?.data || error.message);
            throw error;
        }
    },
    
    updateUserState: async (rut: number, id_estado: number): Promise<any> => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.patch(`/auth/usuarios/${rut}/estado`, { ID_Estado_trabajador: id_estado });
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al actualizar estado de usuario:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default api;

export const reportService = {
    createReport: async (reportData: CreateReportDTO) => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.post('/reportes/', reportData);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al crear reporte:', error.response?.data || error.message);
            throw error;
        }
    },
    
    getAreas: async (): Promise<Area[]> => {
        try {
            console.log('📡 Solicitando áreas...');
            // El token se agrega automáticamente por el interceptor
            const response = await api.get<Area[]>('/reportes/catalogos/areas');
            console.log('✅ Áreas recibidas:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener areas:', error.response?.data || error.message);
            throw error;
        }
    },
    
    getSeveridades: async (): Promise<Severidad[]> => {
        try {
            console.log('📡 Solicitando severidades...');
            // El token se agrega automáticamente por el interceptor
            const response = await api.get<Severidad[]>('/reportes/catalogos/severidad');
            console.log('✅ Severidades recibidas:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener severidades:', error.response?.data || error.message);
            throw error;
        }
    },

    updateReportStatus: async (reporte_id: number, nuevo_estado_id: number, detalle: string, token:string) => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.put(`/reportes/${reporte_id}/estado`, { nuevo_estado_id:nuevo_estado_id, detalle },{headers: { Authorization: `Bearer ${token}` }});
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al actualizar estado del reporte:', error.response?.data || error.message);
            throw error;
        }
    },
    getReportById: async (reportId: number, token: string) => {
    try {
        console.log(`📡 Solicitando reporte con ID: ${reportId}`);
        console.log('🔑 Usando token:', token);
        const response = await api.get(`/reportes/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },
    getAllReports: async (token: string) => {
        try {
            // El token se agrega automáticamente por el interceptor
            const response = await api.get('/reportes/',{
               headers: { Authorization: `Bearer ${token}` 
            }});
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener todos los reportes:', error.response?.data || error.message);
            throw error;
        }
    }
};