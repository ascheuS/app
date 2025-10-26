// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from '../screens/LoadingScreen'; // Necesitamos la pantalla de carga

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Crea el contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crea el Provider (el que manejará el estado)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empieza cargando

  useEffect(() => {
    // Revisa el token al iniciar
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync('userToken');
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
      signIn: async (token: string) => {
        try {
          console.log('🔐 Guardando token en SecureStore:', token);
          await SecureStore.setItemAsync('userToken', token);
          console.log('✅ Token guardado correctamente');
          setUserToken(token);
        } catch (e) {
          console.error('❌ Error guardando token:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          setUserToken(null);
        } catch (e) {
          console.error('Error borrando token', e);
        }
      },
    }),
    [userToken, isLoading]
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