import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { LoginRequest, LoginResponse, PasswordChangeRequest, PasswordChangeResponse, CreateUserRequest, CreateUserResponse } from '../types/auth';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
});

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
            const token = await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.post<PasswordChangeResponse>('/auth/cambiar-password', passwordData, { headers });
            console.log('✅ Contraseña cambiada exitosamente');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al cambiar contraseña:', error.response?.data || error.message);
            throw error;
        }
    }
    ,
    createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.post<CreateUserResponse>('/auth/usuarios', userData, { headers });
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al crear usuario:', error.response?.data || error.message);
            throw error;
        }
    },
    getUsers: async (): Promise<any[]> => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get<any[]>('/auth/usuarios', { headers });
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener usuarios:', error.response?.data || error.message);
            throw error;
        }
    },
    updateUserState: async (rut: number, id_estado: number): Promise<any> => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.patch(`/auth/usuarios/${rut}/estado`, { ID_Estado_trabajador: id_estado }, { headers });
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al actualizar estado de usuario:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default api;

export const reportService = {
    createReport: async (reportData: any) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.post('/reportes', reportData, { headers });
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al crear reporte:', error.response?.data || error.message);
            throw error;
        }
    },
    getAreas: async () => {
        try {
            const response = await api.get('/reportes/catalogos/areas');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener areas:', error.response?.data || error.message);
            throw error;
        }
    },
    getSeveridades: async () => {
        try {
            const response = await api.get('/reportes/catalogos/severidad');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error al obtener severidades:', error.response?.data || error.message);
            throw error;
        }
    }
};