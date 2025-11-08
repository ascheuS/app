// mobile-app/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from '../screens/LoadingScreen';
import { initDatabase } from '../db/database';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  rut: number;
  cargo: number;
  exp: number;
}

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  userCargo?: number | null;
  userRUT?: number | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [userCargo, setUserCargo] = useState<number | null>(null);
  const [userRUT, setUserRUT] = useState<number | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        // 1. Inicializar base de datos (incluye catálogos locales)
        await initDatabase();
        console.log('✅ Base de datos inicializada con catálogos locales');
        
        // 2. Verificar si hay token guardado
        token = await SecureStore.getItemAsync('userToken');
        
        if (token) {
          if (token === 'primer_inicio') {
            // Usuario necesita cambiar contraseña
            await SecureStore.deleteItemAsync('userToken');
            token = null;
          } else {
            // Decodificar token y extraer datos del usuario
            try {
              const decodedToken = jwtDecode<JwtPayload>(token);
              setUserCargo(decodedToken.cargo);
              setUserRUT(decodedToken.rut);
              console.log('✅ Sesión restaurada:', { rut: decodedToken.rut, cargo: decodedToken.cargo });
            } catch (err) {
              // Token inválido o expirado
              console.warn('⚠️ Token inválido/expirado, limpiando sesión:', err);
              await SecureStore.deleteItemAsync('userToken');
              token = null;
            }
          }
        }
      } catch (e) {
        console.error('❌ Error restaurando sesión:', e);
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
      userRUT,
      
      signIn: async (token: string) => {
        try {
          await SecureStore.setItemAsync('userToken', token);
          setUserToken(token);
          
          if (token === 'primer_inicio') {
            // Usuario necesita cambiar contraseña
            await SecureStore.deleteItemAsync('userToken');
            setUserToken(null);
            setUserCargo(null);
            setUserRUT(null);
            return;
          }

          // Decodificar token y guardar datos del usuario
          try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            setUserCargo(decodedToken.cargo);
            setUserRUT(decodedToken.rut);
            console.log('✅ Login exitoso:', { rut: decodedToken.rut, cargo: decodedToken.cargo });
          } catch (err) {
            console.warn('⚠️ No se pudo decodificar token:', err);
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
          setUserRUT(null);
          console.log('✅ Sesión cerrada');
        } catch (e) {
          console.error('❌ Error cerrando sesión:', e);
        }
      },
    }),
    [userToken, isLoading, userCargo, userRUT]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};