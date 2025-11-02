// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from '../screens/LoadingScreen'; // Necesitamos la pantalla de carga

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  userCargo?: number | null;
};

// Crea el contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crea el Provider (el que manejará el estado)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empieza cargando
  const [userCargo, setUserCargo] = useState<number | null>(null);

  useEffect(() => {
    // Revisa el token al iniciar
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Si el token es la marca especial que devuelve el backend en primer inicio,
          // no hacemos la llamada a /auth/me porque no es un JWT válido y provocaría 401.
          if (token === 'primer_inicio') {
            console.warn('Token de primer inicio detectado en SecureStore, eliminando token temporal');
            await SecureStore.deleteItemAsync('userToken');
            token = null;
          } else {
            // Obtener información del usuario desde la API
            try {
              const api = (await import('../services/api')).default;
              const headers = { Authorization: `Bearer ${token}` };
              const resp = await api.get('/auth/me', { headers });
              setUserCargo(resp.data?.ID_Cargo ?? null);
            } catch (err) {
              console.warn('No se pudo obtener info del usuario:', err);
            }
          }
        }
      } catch (e) {
        console.error('Error restaurando token', e);
      }
      setUserToken(token);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const authContextValue = React.useMemo(
    () => ({
      userToken,
      isLoading,
      userCargo,
      signIn: async (token: string) => {
        try {
          console.log('🔐 Guardando token en SecureStore:', token);
          await SecureStore.setItemAsync('userToken', token);
          console.log('✅ Token guardado correctamente');
          setUserToken(token);
          // Obtener cargo del usuario
          try {
            // Evitar llamar a /auth/me si recibimos el marcador especial "primer_inicio"
            if (token === 'primer_inicio') {
              console.warn('Inicio con token de primer inicio: no se solicitará /auth/me');
              // eliminamos el token temporal para evitar loops futuros
              await SecureStore.deleteItemAsync('userToken');
              setUserToken(null);
              setUserCargo(null);
              return;
            }

            const api = (await import('../services/api')).default;
            const headers = { Authorization: `Bearer ${token}` };
            const resp = await api.get('/auth/me', { headers });
            setUserCargo(resp.data?.ID_Cargo ?? null);
          } catch (err) {
            console.warn('No se pudo obtener cargo del usuario:', err);
          }
        } catch (e) {
          console.error('❌ Error guardando token:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          setUserToken(null);
          setUserCargo(null);
        } catch (e) {
          console.error('Error borrando token', e);
        }
      },
    }),
    [userToken, isLoading, userCargo]
  );

  // Muestra Loading mientras se verifica el token inicial
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};