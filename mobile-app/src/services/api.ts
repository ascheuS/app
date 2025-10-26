import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { LoginRequest, LoginResponse } from '../types/auth';

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
    // Aquí puedes agregar más métodos relacionados con autenticación
};

export default api;